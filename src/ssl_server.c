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

int main(void)
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server, client, sd;
  struct sockaddr_in addr;
  socklen_t size = sizeof(struct sockaddr_in);

  char buf[BUFSIZE];
  char msg[MSGSIZE];
  int ret;

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  LOG(ctx = SSL_CTX_new(SSLv23_server_method())); // SSL or TLS汎用でSSL_CTXオブジェクトを生成

  /* サーバ認証設定 */
  SSL_RET(SSL_CTX_use_certificate_file(ctx, S_CERT, SSL_FILETYPE_PEM)); // 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM)); // 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback);// 証明書検証機能の有効化
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ
  
  LOG(server = socket(PF_INET, SOCK_STREAM, 0));
  bzero(&addr, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY; // 全てのアドレスからの要求を受け付ける
  addr.sin_port = htons( TLS_PORT );

  LOG(bind(server, (struct sockaddr*)&addr, sizeof(addr)));
  LOG(listen(server, 10));

  while(1) {
    /* 接続と通信開始 */
    LOG(client = accept(server, (struct sockaddr*)&addr, &size));
    ssl = SSL_new(ctx);/* SSLオブジェクトを生成 */
    SSL_set_fd(ssl, client);/* SSLオブジェクトとファイルディスクリプタを接続 */

    /* SSL通信の開始 */
    LOG(ret = SSL_accept(ssl));
    if (ret > 0) {
      LOG(SSL_read(ssl, buf, sizeof(buf)));
      LOG(snprintf(msg, sizeof(msg), "ack"));
      LOG(SSL_write(ssl, msg, strlen(msg)));
    }

    LOG(sd = SSL_get_fd(ssl));
    LOG(SSL_free(ssl));
    LOG(close(sd));

    int ret = rcvprint( buf );
    if( ret == 0 ) break;
    //fprintf(stderr, "%s\n", buf);
  }

  LOG(close(server));
  LOG(SSL_CTX_free(ctx));

  return EXIT_SUCCESS;
}

