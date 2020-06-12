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

int connection_handle( struct thdata * priv ){

  return 0;
}

int main( int argc, char* argv[] )
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server;
  struct sockaddr_in server_addr;
  char buf[BUFSIZE];
  int ret;

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
  //fprintf(stderr, "size SSL:%ld SSL_CTX:%ld\n", sizeof(*ssl), sizeof(*ctx) );

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

  const int on = 1;
  LOG(server = socket(server_addr.sin_family, SOCK_DGRAM, 0));
  LOG(setsockopt(server, SOL_SOCKET, SO_LINGER, (const void*) &on, (socklen_t) sizeof(on)));
  LOG(setsockopt(server, SOL_SOCKET, SO_REUSEADDR, (const void*) &on, (socklen_t) sizeof(on)));
  DEBUG(fprintf(stderr, "socket() server: %d\n", server));
  LOG(ret = bind(server, (struct sockaddr*)&server_addr, sizeof(server_addr)));
  DEBUG(fprintf(stderr, "bind() server: %d\n", ret));

  BIO *bio;
  int accept = 0;
  while(1) {
    LOG(bio = BIO_new_dgram(server, BIO_NOCLOSE));
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));

    LOGS();
    BIO_ADDR *client = BIO_ADDR_new();
    do {
      ret = DTLSv1_listen(ssl, client);///
      LOGC();
    } while (ret <= 0);
    LOGE(DTLSv1_listen);

    int fd = -1;
    BIO *wbio = SSL_get_wbio(ssl);
    BIO_get_fd(wbio, &fd);
    if (!wbio || BIO_connect(fd, client, 0) == 0) {
      fprintf(stderr, "ERROR - unable to connect\n");
      BIO_ADDR_free(client);
      goto cleanup;
    }
    (void)BIO_ctrl_set_connected(wbio, client);
    BIO_ADDR_free(client);

//    /* Handle client connection */
//    int client_fd = socket(AF_INET6, SOCK_DGRAM, 0);
//    LOG(ret = bind(client_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)));
//    connect(client_fd, (struct sockaddr*)&client_addr, sizeof(struct sockaddr));
//
//    /* Set new fd and set BIO to connected */
//    BIO *cbio = SSL_get_wbio(ssl);
//    BIO_set_fd(cbio, client_fd, BIO_NOCLOSE);
//    (void)BIO_ctrl_set_connected(cbio, client_addr);

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
    BIO_closesocket(fd);
    LOG(SSL_free(ssl));
    ret = rcvprint( buf );
    if( ret == 0 ) break;
  }

  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

