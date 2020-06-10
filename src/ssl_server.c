#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>

#include "common_data.h"

#define M_SERVER  1

int connection_handle( int client, SSL *ssl ){
  char buf[BUFSIZE];
  int ret;
  int sd;

  LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));/* 証明書交換時のキー作成機能有効化 */

  LOG( ret = SSL_accept(ssl) );/* SSL通信接続 */
  ssl_check_error( ssl, ret );
  DEBUG( if(SSL_session_reused(ssl)) fprintf(stderr, "server SSL_session_reused\n") );

#if (ONE_SEND == 1)
  do {
    ssl_check_read(ssl, buf);
  } while((rcvprint( buf ) % RE_TRY));
#else
  ssl_check_read(ssl, buf);
#endif
#if (SERVER_REPLY == 1)
    ssl_check_write( ssl, "ack", 4);
#endif // (SERVER_REPLY == 1)

  ssl_check_shutdown( ssl );

  LOG(sd = SSL_get_fd(ssl));
  LOG(SSL_free(ssl));
  LOG(close(sd));

  ret = rcvprint( buf );
  if ( ret )
    return 0;
  else
    return 1;
}

/* void sess_cache_init(); */
/* void sess_cache_terminate(); */
/* int sess_cache_new(SSL *ssl, SSL_SESSION *sess); */
/* SSL_SESSION *sess_cache_get(SSL *ssl, unsigned char *key, int key_len, int *copy); */
/* void sess_cache_remove(SSL_CTX *ctx, SSL_SESSION *sess); */

int main( int argc, char* argv[] )
{
  SSL_CTX *ctx;
  SSL *ssl;
  const long flags=SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_TLSv1_2;
  const char ciphers[] = "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256";
  const unsigned char session_id[] = "inspircd";

  set_argument( argc, argv );

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(TLS_server_method()); // SSL or TLS汎用でSSL_CTXオブジェクトを生成

  SSL_RET(SSL_CTX_set_ciphersuites(ctx, ciphers));

  /* セッション関連の設定 */
  SSL_CTX_set_session_id_context(ctx, session_id, sizeof(session_id));
  SSL_CTX_set_session_cache_mode(ctx, SSL_SESS_CACHE_BOTH );
#if (TEST_SSL_SESSION == 1)
  //SSL_CTX_sess_set_new_cb(ctx, sess_cache_new);
  //SSL_CTX_sess_set_get_cb(ctx, sess_cache_get);
  //SSL_CTX_sess_set_remove_cb(ctx, sess_cache_remove);
#endif // (TEST_SSL_SESSION == 1)
  
  /* サーバ認証設定 */
  SSL_CTX_set_options(ctx, flags);
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, S_CERT)); // 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM)); // 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback);// 証明書検証機能の有効化
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ
	SSL_CTX_set_read_ahead(ctx, 1);
	SSL_CTX_set_cookie_generate_cb(ctx, generate_cookie);
	LOG(SSL_CTX_set_cookie_verify_cb(ctx, &verify_cookie));

  int server_fd, client_fd, fd_max, fds[THREAD_MAX * 2];
  LOG(server_fd = get_settings_fd(NULL, SOCK_STREAM, TEST_RECEIVER, NULL));

  int size;
  static struct sockaddr_in client_addr = {0};
  fd_set ready;
  struct timeval to;
  struct thdata *th = sock_thread_create( connection_handle );
  to.tv_sec  = 3;
  to.tv_usec = 0;
  while(1) {
    LOGS();
    FD_ZERO(&ready);
    FD_SET(server_fd, &ready);
    if (select(server_fd + 1, &ready, (fd_set *)0, (fd_set *)0, &to) == -1) {
      perror("select");
      break;
    }
    LOGE(select);

    if (FD_ISSET(server_fd, &ready))
    {
      /* 接続と通信開始 */
      LOG(client_fd = accept(server_fd, &client_addr, &size));
      DEBUG(fprintf(stderr, "accept family:0x%08X data:%.14s size:%d\n",
                    client_addr.sa_family, client_addr.sa_data, size));
      /* SSLオブジェクトを生成 */
      LOG(ssl = SSL_new(ctx));
      LOG(SSL_set_fd(ssl, client_fd));/* SSLオブジェクトとファイルディスクリプタを接続 */
      /* メッセージ受信用のスレッドで情報受信  */
      if( sock_thread_post( th, client_fd, ssl ) ) break;
    }
  }
  sock_thread_join( th );

  SSL_CTX_free(ctx);
  close(server_fd);
  return EXIT_SUCCESS;
}

