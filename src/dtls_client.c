#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>
#include <openssl/rand.h>
#include <openssl/dtls1.h>

#include "common_data.h"

int main(void)
{
  int mysocket;
  struct sockaddr_in server;
  //struct sockaddr_in local;

  SSL *ssl;
  SSL_CTX *ctx;
  char msg[BUFSIZE];
  char log[128];

  memset(&server, 0, sizeof(server));
  server.sin_family = AF_INET;
  if (inet_aton(HOST_IP, &server.sin_addr) == 0) {
    fprintf(stderr, "Invalid IP Address.\n");
    exit(EXIT_FAILURE);
  }
  server.sin_port = htons( TLS_PORT );
  //sockaddr_in server = SOCKADDR_IN_INIT( AF_INET, htons(port), InAddr(HOST_IP) );

  int i = 0;
  BIO *bio;
  int size;
  const long flags=(SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1);

  while(1){
    size = get_data(i++, "dtls", msg, log );
    if ( 0 == size ){
      break;
    }

    /* 前準備 */
    LOG(SSL_load_error_strings());
    LOG(SSL_library_init());
    LOG(ctx = SSL_CTX_new(DTLS_client_method()));

    /* 認証設定 */
    LOG(SSL_CTX_set_options(ctx, flags));/* SSLv2はセキュリティ的にNGなので除く*/
    SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, C_CERT));// 証明書の登録
    SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
    SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
    LOG(SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback));// 証明書検証機能の有効化
    LOG(SSL_CTX_set_verify_depth (ctx, 2));// 証明書チェーンの深さ
    LOG(SSL_CTX_set_read_ahead(ctx, 1));

    /* 接続 */
    LOG(mysocket = socket(AF_INET, SOCK_DGRAM, 0));
    LOG(connect(mysocket, (struct sockaddr*)&server, sizeof(server)));
    LOG(bio = BIO_new_dgram(mysocket, BIO_NOCLOSE));
    LOG(BIO_ctrl(bio, BIO_CTRL_DGRAM_SET_CONNECTED, 0, &server));
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_connect(ssl));///

    /* 通信 */
    do {
      if(ssl_check_write(ssl, msg, size)){
        goto cleanup;
      }

#if (ONE_SEND == 1)
      endprint(log);
      size = get_data(i++, "dtls", msg, log );
      if (size == 0){
        break;
      }
#else // (ONE_SEND == 1)
      break;
#endif //(ONE_SEND == 1)
    } while (1);

    /* 切断 */
    ssl_check_shutdown( ssl );
    
  cleanup:
    LOG(close(mysocket));
    LOG(SSL_free(ssl));
    LOG(SSL_CTX_free(ctx));

#if (ONE_SEND == 0)
    endprint(log);
#else// (ONE_SEND == 0)
    break;
#endif// (ONE_SEND == 0)
  }

  return EXIT_SUCCESS;
}


