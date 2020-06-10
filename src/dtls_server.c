#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>
#include <openssl/rand.h>
#include <openssl/dtls1.h>

#include "common_data.h"

int connection_handle( int client, SSL *ssl ){
}

int main( int argc, char* argv[] )
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server, client;
  struct sockaddr_in server_addr;
  struct sockaddr_storage client_addr;
  char buf[BUFSIZE];

  set_argument( argc, argv );

  SSL_load_error_strings();
  SSL_library_init();
  ERR_load_BIO_strings();
  OpenSSL_add_all_algorithms();
  // DTLSv1_2_server_method
  // DTLS_server_method
  ctx = SSL_CTX_new(DTLS_server_method());
  SSL_CTX_set_session_cache_mode(ctx, SSL_SESS_CACHE_BOTH);
  DEBUG( fprintf(stderr, "session_cache_mode:0x%08lx\n", SSL_CTX_get_session_cache_mode(ctx)) );

  /* サーバ認証設定 */
  SSL_CTX_set_options(ctx, SSL_OP_NO_SSLv2);/* SSLv2はセキュリティ的にNGなので除く*/
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

  const unsigned char session_id[] = "inspircd";
  SSL_CTX_set_session_id_context(ctx, session_id, sizeof(session_id));

  LOG(server = socket(server_addr.sin_family, SOCK_DGRAM, 0));
  LOG(bind(server, (struct sockaddr*)&server_addr, sizeof(server_addr)));

  BIO *bio;
  int accept = 0;
  int ret;
  while(1) {
    LOG(bio = BIO_new_dgram(server, BIO_NOCLOSE));
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_fd(ssl, server));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));

    LOGS();
    do {
      ret = DTLSv1_listen(ssl, (BIO_ADDR *)&client_addr);///
      LOGC()
    }while (ret <= 0);
    LOGE(DTLSv1_listen);

    LOGS();
    do {
      accept = SSL_accept(ssl);
      LOGC();
    } while(accept == 0);
    LOGE(SSL_accept);
    DEBUG( if(SSL_session_reused(ssl)) fprintf(stderr, "server SSL_session_reused\n") );

    do {
      if(ssl_check_read(ssl , buf)){
        goto cleanup;
      }
#if (ONE_SEND == 1)
      if ((rcvprint( buf ) % RE_TRY) == 0){
        break;
      }
#else // (ONE_SEND == 1)
      break;
#endif // (ONE_SEND == 1)
    } while(1);

    /* 切断 */
    ssl_check_shutdown( ssl );
    
  cleanup:
    LOG(SSL_free(ssl));
    ret = rcvprint( buf );
    if( ret == 0 ) break;
  }

  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

