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

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(SSLv23_server_method()); // SSL or TLS汎用でSSL_CTXオブジェクトを生成

  /* サーバ認証設定 */
  SSL_RET(SSL_CTX_use_certificate_file(ctx, S_CERT, SSL_FILETYPE_PEM)); // 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM)); // 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback);// 証明書検証機能の有効化
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ
  
  server = socket(PF_INET, SOCK_STREAM, 0);
  bzero(&addr, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY; // 全てのアドレスからの要求を受け付ける
  addr.sin_port = htons( TLS_PORT );

  bind(server, (struct sockaddr*)&addr, sizeof(addr));
  listen(server, 10);

  while(1) {
    /* 接続と通信開始 */
    client = accept(server, (struct sockaddr*)&addr, &size);
    ssl = SSL_new(ctx);/* SSLオブジェクトを生成 */
    SSL_set_fd(ssl, client);/* SSLオブジェクトとファイルディスクリプタを接続 */

    if (SSL_accept(ssl) > 0) {/* SSL通信の開始 */
      SSL_read(ssl, buf, sizeof(buf));
      snprintf(msg, sizeof(msg), "ack");
      SSL_write(ssl, msg, strlen(msg));
    }

    sd = SSL_get_fd(ssl);
    SSL_free(ssl);
    close(sd);

    int ret = rcvprint( buf );
    if( ret == 0 ) break;
    //fprintf(stderr, "%s\n", buf);
  }

  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

