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
    if (rcvprint( buf ) == 0){
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

#if (ONE_SEND == 0)
  ret = rcvprint( buf );
#endif // (ONE_SEND == 0)
}


int main(void)
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server, client;
  struct sockaddr_in addr;
  const int on = 1;

  const long flags=SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_TLSv1_2;
  //const long flags=SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1;

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(TLS_server_method()); // SSL or TLS汎用でSSL_CTXオブジェクトを生成

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

  bzero(&addr, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY; // 全てのアドレスからの要求を受け付ける
  addr.sin_port = htons( TLS_PORT );

  server = socket(addr.sin_family, SOCK_STREAM, 0);
  setsockopt(server, SOL_SOCKET, SO_LINGER, (const void*) &on, (socklen_t) sizeof(on));
  setsockopt(server, SOL_SOCKET, SO_REUSEADDR, (const void*) &on, (socklen_t) sizeof(on));
  bind(server, (struct sockaddr*)&addr, sizeof(addr));
  listen(server, 10);

  struct thdata *th = sock_thread_create( connection_handle );
  while(1) {
    /* 接続と通信開始 */
    LOG(client = accept(server, NULL, NULL));
    /* SSLオブジェクトを生成 */
    LOG(ssl = SSL_new(ctx));
    /* メッセージ受信用のスレッドでジュ受信  */
    sock_thread_post( th, client, ssl );
  }
  sock_thread_join( th );

  SSL_CTX_free(ctx);
  close(server);
  return EXIT_SUCCESS;
}

