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

int connection_handle( void * priv ){
  SSL * ssl = ((struct thdata*)priv)->ssl;
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

  socklen_t addrlen;
  struct sockaddr_in client_addr;
  int listener_fd, client_fd;
  LOG(listener_fd = get_settings_fd(NULL, SOCK_STREAM, TEST_RECEIVER, NULL));

  //////////////////////////////////////// epoll
  /* ソケットをepollに追加 */
  int epfd, nfd;
  struct epoll_event event;
  struct epoll_event events[ CLIENT_MAX ];
  if((epfd = epoll_create( CLIENT_MAX )) < 0) {
    fprintf(stderr, "epoll_create()\\n");
    exit(1);
  }
  memset(&event, 0, sizeof(event));
  event.events  = EPOLLIN | EPOLLET; /* "man epoll" から拝借 */
  event.data.fd = listener_fd;
  if (epoll_ctl(epfd, EPOLL_CTL_ADD, listener_fd, &event) < 0) {
    fprintf(stderr, "epoll_ctl()\\n");
    exit(1);
  }
  DEBUG(fprintf(stderr, "epoll listener_fd:%d epfd:%d\n", listener_fd, epfd ));
  //////////////////////////////////////// epoll
  
  struct thdata *ths = sock_thread_create( connection_handle );
  for(;;){
    LOG( nfd = epoll_wait(epfd, events, CLIENT_MAX, -1) );
    if(nfd < 0) {
        fprintf(stderr, "epoll_wait()\\n");
        exit(1);
    }

    for(int i = 0; i < nfd; ++i) {
      DEBUG(fprintf(stderr, "epoll listener_fd:%d epfd:%d\n", listener_fd, epfd ));
      if(events[i].data.fd != listener_fd) {
        /* スレッドで処理するのでここでは何もしなくて良いかも */
        continue;
      }

      /* 接続と通信開始 */
      bzero( &client_addr, sizeof(client_addr) );
      LOG(client_fd = accept(listener_fd, (struct sockaddr *)&client_addr, &addrlen ) );
      DEBUG(fprintf(stderr, "accept, client_fd:%d, family:0x%08X, port:%d, size:%d\n",
                    client_fd, client_addr.sin_family, client_addr.sin_port, addrlen));

      /* SSLオブジェクトを生成 */
      LOG(ssl = SSL_new(ctx));
      LOG(SSL_set_fd(ssl, client_fd));/* SSLオブジェクトとファイルディスクリプタを接続 */

      /* メッセージ受信用のスレッドで情報受信  */
      if( sock_thread_post( ths, client_fd, ssl ) ) break;

      /* */
      memset(&event, 0, sizeof(event));
      event.events  = EPOLLIN | EPOLLET; /* "man epoll" から拝借 */
      epoll_ctl(epfd, EPOLL_CTL_ADD, client_fd, &event);
    }
  }
  sock_thread_join( ths );

  SSL_CTX_free(ctx);
  close(listener_fd);
  return EXIT_SUCCESS;
}

