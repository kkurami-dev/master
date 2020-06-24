#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include <sys/types.h>
#include <sys/epoll.h>
#include <netinet/in.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>

#include "common_data.h"

#define M_SERVER  1

int connection_handle( void * th ){
  struct thdata* priv = (struct thdata*)th;
  SSL * ssl = priv->ssl;
  int ret = 0;

  if ( TP_CONNECT & priv->act ){
    DEBUG0(fprintf(stderr, "connection_handle(): CONNECT\n"));
    LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));/* 証明書交換時のキー作成機能有効化 */
    LOG( ret = SSL_accept(ssl) );/* SSL通信接続 */
    ssl_check_error( ssl, ret );
    DEBUG( if(SSL_session_reused(ssl)) fprintf(stderr, "server SSL_session_reused\n") );
    ret = 1;
  }

  if ( TP_MSG & priv->act ){
    DEBUG0(fprintf(stderr, "connection_handle(): MSG\n"));
    char buf[BUFSIZE];

#if 0
    do {
      ssl_check_read(ssl, buf);
    } while((rcvprint( buf ) % RE_TRY));
    ret = 0;
#else
    ssl_check_read(ssl, buf);
    ret = rcvprint( buf );
    DEBUG( fprintf(stderr, "ssl_check_read(): r:%d %.40s\n", ret, buf) );
    if( ret == 0 )  priv->act  |= TP_CLOSE;
#endif
#if (SERVER_REPLY == 1)
    ssl_check_write( ssl, "ack", 4);
    ret = rcvprint( buf );
#endif // (SERVER_REPLY == 1)
  }

  if ( TP_CLOSE & priv->act ){
    DEBUG0(fprintf(stderr, "connection_handle(): CLOSE\n"));
    LOG(ssl_check_shutdown( ssl ));
    LOG( ret = SSL_get_shutdown( ssl ) );
    DEBUG0(fprintf(stderr, "SSL_get_shutdown():%d\n", ret));
    LOG(int sd = SSL_get_fd(ssl));
    //LOG( SSL_clear(ssl) );
    LOG(SSL_free(ssl));
    LOG(close(sd));

    priv->ssl = NULL;
    priv->end = 1;
    return 1;
  }

  if ( ret % RE_TRY )
    return 0;
  else {
    priv->end = 1;
    return 1;
  }
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
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, "."));// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ
	SSL_CTX_set_read_ahead(ctx, 1);
	SSL_CTX_set_cookie_generate_cb(ctx, generate_cookie);
	LOG(SSL_CTX_set_cookie_verify_cb(ctx, &verify_cookie));
  SSL_CTX_set_verify(ctx,
                     (SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT | SSL_VERIFY_CLIENT_ONCE),
                     verify_callback);// 証明書検証機能の有効化
  
  //SSL_CTX_set_cert_verify_callback(ctx, NULL, NULL);
  //   s->ctx->app_verify_callback

  socklen_t addrlen;
  struct sockaddr_storage client_addr;
  int listener_fd;
  int client_fd;
  LOG(listener_fd = get_settings_fd(NULL, SOCK_STREAM, TEST_RECEIVER, NULL));

  //////////////////////////////////////// epoll
  /* ソケットをepollに追加 */
  int epfd, nfd;
  struct ssl_data {
    SSL *ssl;
    int  state;
    int  state_c;
  };
  struct epoll_event event;
  struct epoll_event events[ OPT_CLIENT_NUM ];
  if((epfd = epoll_create( OPT_CLIENT_NUM )) < 0) {
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

  int client_end = 0;
  int ret = 0;
  struct thdata *ths = sock_thread_create( connection_handle );
  for(;;){
    LOG( nfd = epoll_wait(epfd, events, OPT_CLIENT_NUM, -1) );
    if(nfd < 0) {
        fprintf(stderr, "epoll_wait() erro  \n");
        exit(1);
    }

    for(int i = 0; i < nfd; ++i) {
      DEBUG1(fprintf(stderr, "epoll nfd:%d i:%d\n", nfd, i  ));

      int ssl_s = 0;
      epoll_data_t *ev_data = &events[i].data;
      struct ssl_data *  ssl_d = (struct ssl_data *)ev_data->ptr;
      client_fd = ev_data->fd;
      if(ev_data->fd != listener_fd && client_fd) {
        /* スレッドで処理するのでここでは何もしなくて良いかも */
        ssl = ssl_d->ssl;
        LOG( ret = SSL_get_state( ssl ) );
        LOG( ssl_s = SSL_get_shutdown( ssl ) );
        /*
         * ssl_s shutdown 中は 3
         * TLS_ST_OK : 1
         * TLS_ST_EARLY_DATA : 
         * TLS_ST_PENDING_EARLY_DATA_END :
         */
        DEBUG0(fprintf(stderr, "epoll client_fd[%d] i:%d ev:%#x state:%d:%s s_c:%d ss:%d:%s\n",
                       client_fd, i, events[i].events, ret, tls_log_w[ret], ssl_d->state_c, ssl_s, tls_log_w[ssl_s] ));
        if( events[i].events & EPOLLIN && !ssl_s ){
          if( TLS_ST_OK == ret ){
            LOG( sock_thread_post(ths, client_fd, ssl, TP_MSG) );
          }
          ssl_d->state_c++;
        }
        if( events[i].events & EPOLLOUT ) {
        }
        /*
         * ヘンナのは終わらせる
         */
        if( events[i].events & ~(EPOLLIN | EPOLLOUT) || ssl_s) {
          if (epoll_ctl(epfd, EPOLL_CTL_DEL, client_fd, &events[i]) != 0) PERROR("epoll_ctl");
          LOG( sock_thread_post(ths, client_fd, ssl, TP_CLOSE) );
          //LOG( SSL_free(ssl) );
          LOG( close(client_fd) );
          LOG( free(ssl_d) );
          ev_data->ptr = NULL;
          bzero( &events[i], sizeof( events[i] ));
          client_end++;
        }
        continue;
      }
      DEBUG0(fprintf(stderr, "epoll i:%d listener_fd:%d epfd:%d\n", i, listener_fd, epfd));

      /* 接続と通信開始 */
      bzero( &client_addr, sizeof(client_addr) );
      LOG(client_fd = accept(listener_fd, (struct sockaddr *)&client_addr, &addrlen ) );
      DEBUG(fprintf(stderr, "epoll i:%d accept, client_fd:%d, family:0x%08X, size:%d\n",
                    i, client_fd, client_addr.ss_family, addrlen));
      if(client_fd < 0){
        PERROR("accept");
        goto errend;
      }

      /* SSLオブジェクトを生成 */
      LOG(ssl = SSL_new(ctx));
      LOG(SSL_set_fd(ssl, client_fd));/* SSLオブジェクトとファイルディスクリプタを接続 */

      /* メッセージ受信用のスレッドで情報受信  */
      LOG(sock_thread_post( ths, client_fd, ssl, TP_CONNECT ));

      /* */
      memset(&event, 0, sizeof(event));
      event.events  = EPOLLIN | EPOLLET; /* "man epoll" から拝借 */
      event.data.fd = client_fd;
      event.data.ptr = malloc(sizeof( struct ssl_data ));
      memset(event.data.ptr, 0, sizeof(struct ssl_data));
      ((struct ssl_data *)event.data.ptr)->ssl = ssl;
      epoll_ctl(epfd, EPOLL_CTL_ADD, client_fd, &event);
    }

    DEBUG(fprintf(stderr, "main OPT_CLIENT_NUM:%d, end_c:%d\n", OPT_CLIENT_NUM, client_end));
    if( client_end < OPT_CLIENT_NUM){
    } else {
      break;
    }
  }
  sock_thread_join( ths );

 errend:
  LOG(SSL_CTX_free(ctx));
  LOG(close(listener_fd));
  return EXIT_SUCCESS;
}

