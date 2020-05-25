#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include "common_data.h"

int main(void)
{
  int mysocket;
  struct sockaddr_in server;

  SSL *ssl;
  SSL_CTX *ctx;

  char log[128];
  char msg[BUFSIZE];
  char buf[BUFSIZE + 1];

  memset(&server, 0, sizeof(server));
  server.sin_family = AF_INET;
  if (inet_aton(HOST_IP, &server.sin_addr) == 0) {
    fprintf(stderr, "Invalid IP Address.\n");
    exit(EXIT_FAILURE);
  }
  //server.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  server.sin_port = htons( TLS_PORT );
  //sockaddr_in server = SOCKADDR_IN_INIT( AF_INET, htons(port), InAddr(HOST_IP) );

  int i = 0;
  while(1){
    int retval = 0;
    int size = get_data(i++, " ssl", msg, log );
    if ( 0 == size ){
      fprintf(stderr, "end\n\n");
      break;
    }

    LOG(mysocket = socket(AF_INET, SOCK_STREAM, 0)); 
    if (mysocket < 0) {
      perror("socket");
      fprintf(stderr, "\n%d :%d errno:%d\n\n", __LINE__, mysocket, errno );
      exit(EXIT_FAILURE);
    }
    LOG(retval = connect(mysocket, (struct sockaddr*) &server, sizeof(server)));
    if (retval){
      fprintf(stderr, "\n%d :%d errno:%d\n\n", __LINE__, retval, errno );
      perror("connect");
      exit(EXIT_FAILURE);
    }
 
    SSL_load_error_strings();
    LOG(SSL_library_init());
    LOG(ctx = SSL_CTX_new(SSLv23_client_method()));

    /* クライアント認証設定 (テストなのでエラー確認のを除く) */
    //SSL_RET(SSL_CTX_set_options(ctx, SSL_OP_NO_SSLv2));/* SSLv2はセキュリティ的にNGなので除く*/
    SSL_RET(SSL_CTX_use_certificate_file(ctx, C_CERT, SSL_FILETYPE_PEM));// 証明書の登録
    SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
    SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
    SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER, verify_callback);// 証明書検証機能の有効化
    SSL_CTX_set_verify_depth(ctx,9);// 証明書チェーンの深さ

    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_fd(ssl, mysocket));

    /* 接続 */
    LOGS();
    if( -1 == SSL_connect(ssl) ){
      /* 接続失敗したら処理を最初からやり直す  */
      fprintf(stderr, "\nSSL_connect failed with :%d errno:%d\n\n", SSL_get_error(ssl, -1), errno );
      goto cleanup;
    }
    LOGE( SSL_connect() );

    do {
      /*  受送信処理 */
      ssl_check_write(ssl, msg, size);
      ssl_check_read(ssl, buf);

#if (ONE_SEND == 1)
      /* 接続をしたまま、再度メッセージを送る */
      endprint(log);
      if ( get_data(i++, " ssl", msg, log ) == 0){
        break;
      }
#else
      break;
#endif
    } while(1);

    /* 切断 */
    LOG(SSL_shutdown(ssl));

  cleanup:
    LOG(SSL_free(ssl)); 
    LOG(SSL_CTX_free(ctx));
    ERR_free_strings();
    LOG(close(mysocket));

#if (ONE_SEND == 0)
    endprint(log);
#else
    break;
#endif
  }

  return EXIT_SUCCESS;
}


