#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>
#include <openssl/dtls1.h>

#include "common_data.h"

#define BUFFER_SIZE          (1<<16)
#define M_SERVER  0


void connection_handle( int clitSock, SSL *ssl ){
  int accept = 0;
  char buf[BUFSIZE];

  LOGS();
  while(accept == 0) {
    accept = SSL_accept(ssl);
    LOGC();
  }
  LOGE(SSL_accept);

  do {
    if(ssl_check_read(ssl , buf)){
      goto cleanup;
    }
#if (ONE_SEND == 1)
    if (rcvprint( buf ) == 0){
      break;
    }
#else // (ONE_SEND == 1)
    break;
#endif // (ONE_SEND == 1)
  } while(1);

  ssl_check_shutdown( ssl );

 cleanup:
  LOGR(SSL_free(ssl));

#if (ONE_SEND == 0)
  rcvprint( buf );
#endif // (ONE_SEND == 0)
}

int main(void)
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server;
  struct sockaddr_in server_addr;
  struct sockaddr_storage client_addr;
  const long flags=(SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1);

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(DTLS_server_method());

  /* サーバ認証設定 */
  SSL_CTX_set_options(ctx, flags);
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, S_CERT)); // 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM)); // 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback);// 証明書検証機能の有効化
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ

  bzero(&server_addr, sizeof(server_addr));
  server_addr.sin_family = AF_INET;
  server_addr.sin_addr.s_addr = INADDR_ANY;
  server_addr.sin_port = htons(TLS_PORT);

	SSL_CTX_set_read_ahead(ctx, 1);
	SSL_CTX_set_cookie_generate_cb(ctx, generate_cookie);
	SSL_CTX_set_cookie_verify_cb(ctx, &verify_cookie);

  LOGR(server = socket(server_addr.sin_family, SOCK_DGRAM, 0));
  LOGR(bind(server, (struct sockaddr*)&server_addr, sizeof(server_addr)));

  BIO *bio;
  int ret;
  struct thdata *th = sock_thread_create( connection_handle );
  while(1) {
    LOGR(bio = BIO_new_dgram(server, BIO_NOCLOSE));
    LOGR(ssl = SSL_new(ctx));
    LOGR(SSL_set_fd(ssl, server));
    LOGR(SSL_set_bio(ssl, bio, bio));
    LOGR(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));

    LOGS();
    do {
      ret = DTLSv1_listen(ssl, (BIO_ADDR *)&client_addr);///
      LOGC()
    }while (ret <= 0);
    LOGE(DTLSv1_listen);

#if (M_SERVER ==1)
    sock_thread_post( th, server, ssl );
#else //(M_SERVER ==1)
    int accept = 0;
    char buf[BUFSIZE];
    LOGS();
    while(accept == 0) {
      accept = SSL_accept(ssl);
      LOGC();
    }
    LOGE(SSL_accept);

    do {
      if(ssl_check_read(ssl , buf)){
        goto cleanup;
      }
#if (ONE_SEND == 1)
      if (rcvprint( buf ) == 0){
        break;
      }
#else // (ONE_SEND == 1)
      break;
#endif // (ONE_SEND == 1)
    } while(1);

    ssl_check_shutdown( ssl );
    
  cleanup:
    LOGR(SSL_free(ssl));

#if (ONE_SEND == 0)
    ret = rcvprint( buf );
    if( ret == 0 ) break;
#else // (ONE_SEND == 0)
    break;
#endif // (ONE_SEND == 0)
#endif // (M_SERVER ==1)
  }
  sock_thread_join( th );
  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

