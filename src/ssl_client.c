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
  int read_size;

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
      break;
    }

    LOG(mysocket = socket(AF_INET, SOCK_STREAM, 0)); 
    if (mysocket < 0) {
      perror("socket");
      exit(EXIT_FAILURE);
    }
    LOG(retval = connect(mysocket, (struct sockaddr*) &server, sizeof(server)));
    if (retval){
      fprintf(stderr, "%d :%d errno:%d\n", __LINE__, retval, errno );
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

    /* 接続 */
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_fd(ssl, mysocket));
    LOG(retval = SSL_connect(ssl));
    if ( retval <= 0 ){
      fprintf(stderr, "SSL_connect failed with :%d errno:%d\n", SSL_get_error(ssl, retval), errno );
      exit(EXIT_FAILURE);
    }

    /* 通信開始 */
    LOG(SSL_write(ssl, msg, size));
    do {
      LOG(read_size = SSL_read(ssl, buf, BUFSIZE));
    } while (read_size > 0);

    /* 切断 */
    LOG(SSL_shutdown(ssl));
    LOG(SSL_free(ssl)); 
    LOG(SSL_CTX_free(ctx));
    ERR_free_strings();
    LOG(close(mysocket));
    endprint(log);
  }

  return EXIT_SUCCESS;
}


