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

int main(void)
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server, client, sd;
  int port = 32323;

  struct sockaddr_in addr;
  socklen_t size = sizeof(struct sockaddr_in);

  char buf[BUFSIZE];

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(DTLSv1_2_server_method());

  /* サーバ認証設定 */
  SSL_CTX_use_certificate_file(ctx, S_CERT, SSL_FILETYPE_PEM); // 証明書の登録
  SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM); // 秘密鍵の登録
  //SSL_CTX_load_verify_locations(ctx, ca_certificate, NULL);// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback);// 証明書検証機能の有効化
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ

  server = socket(PF_INET, SOCK_STREAM, 0);
  bzero(&addr, sizeof(addr));
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY;
  addr.sin_port = htons(port);

  bind(server, (struct sockaddr*)&addr, sizeof(addr));
  listen(server, 10);

  while(1) {
    client = accept(server, (struct sockaddr*)&addr, &size);
    ssl = SSL_new(ctx);
    SSL_set_fd(ssl, client);

    if (SSL_accept(ssl) > 0) {
      SSL_read(ssl, buf, BUFSIZE);
    }

    sd = SSL_get_fd(ssl);
    SSL_free(ssl);
    close(sd);

    int ret = rcvprint( buf );
    if( ret == 0 ) break;
    fprintf(stderr, "%s\n", buf);
    memset(buf, 0x00, BUFSIZE);
  }

  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

