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

  SSL *ssl;
  SSL_CTX *ctx;
  char msg[BUFSIZE];

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
  int len = 0;
  while(1){
    int size = get_data(i++, "dtls", msg );
    if ( 0 == size ){
      break;
    }

    /* 前準備 */
    SSL_load_error_strings();
    SSL_library_init();
    ctx = SSL_CTX_new(DTLSv1_2_client_method());

    /* 認証設定 */
    /* クライアント認証設定 (テストなのでエラー確認のを除く) */
    //SSL_RET(SSL_CTX_set_options(ctx, SSL_OP_NO_SSLv2));/* SSLv2はセキュリティ的にNGなので除く*/
    SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, C_CERT));// 証明書の登録
    SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
    //SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
    SSL_CTX_set_verify_depth (ctx, 2);// 証明書チェーンの深さ
    SSL_CTX_set_read_ahead(ctx, 1);

    /* 接続 */
    mysocket = socket(AF_INET, SOCK_DGRAM, 0);
    connect(mysocket, &server, sizeof(server));
    BIO *bio = BIO_new_dgram(mysocket, BIO_NOCLOSE);
    LOG(BIO_ctrl(bio, BIO_CTRL_DGRAM_SET_CONNECTED, 0, &server));
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_connect(ssl));///

    /* 通信 */
    LOG(len = SSL_write(ssl, msg, size));
    SSL_get_error(ssl, len);

    /* 切断 */
    SSL_shutdown(ssl);
    close(mysocket);
    endprint();
  }

  return EXIT_SUCCESS;
}


