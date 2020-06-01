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

void connection_handle( int client, SSL *ssl ){
  char buf[BUFSIZE];
  int ret;
  int sd;

  LOG(SSL_set_fd(ssl, client));/* SSLオブジェクトとファイルディスクリプタを接続 */
  LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));//

  /* SSL通信の開始 */
  LOGS();
  do{
    ret = SSL_accept(ssl);
    ret = ssl_get_accept( ssl, ret );
    LOGC();
    //} while(ret > 0);
  } while(ret);
  LOGE( SSL_accept );

  do {
    ssl_check_read(ssl, buf);

#if (SERVER_REPLY == 1)
    ssl_check_write( ssl, "ack", 4);
#endif // (SERVER_REPLY == 1)

#if (ONE_SEND == 1)
    if (0 == (rcvprint( buf ) % RE_TRY)){
      break;
    }
#else
    break;
#endif
  } while(1);

  ssl_check_shutdown( ssl );

  LOG(sd = SSL_get_fd(ssl));
  LOG(SSL_free(ssl));
  LOG(close(sd));

  ret = rcvprint( buf );
}

/* void sess_cache_init(); */
/* void sess_cache_terminate(); */
/* int sess_cache_new(SSL *ssl, SSL_SESSION *sess); */
/* SSL_SESSION *sess_cache_get(SSL *ssl, unsigned char *key, int key_len, int *copy); */
/* void sess_cache_remove(SSL_CTX *ctx, SSL_SESSION *sess); */

int main(void)
{
  int server_fd, client_fd;

  SSL_CTX *ctx;
  SSL *ssl;
  const long flags=SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_TLSv1_2;

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(TLS_server_method()); // SSL or TLS汎用でSSL_CTXオブジェクトを生成

#if (TEST_SSL_SESSION == 1)
  SSL_CTX_set_session_cache_mode(ctx, SSL_SESS_CACHE_BOTH );
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
	SSL_CTX_set_cookie_verify_cb(ctx, &verify_cookie);

  server_fd = get_settings_fd(NULL, SOCK_STREAM, TEST_RECEIVER, NULL);

  struct thdata *th = sock_thread_create( connection_handle );
  while(1) {
    /* 接続と通信開始 */
    LOG(client_fd = accept(server_fd, NULL, NULL));
    /* SSLオブジェクトを生成 */
    LOG(ssl = SSL_new(ctx));
    /* メッセージ受信用のスレッドで情報受信  */
    sock_thread_post( th, client_fd, ssl );
  }
  sock_thread_join( th );

  SSL_CTX_free(ctx);
  close(server_fd);
  return EXIT_SUCCESS;
}

