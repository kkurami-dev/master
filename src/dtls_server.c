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
  char crt_file[] = "server.crt";
  char key_file[] = "server.key";

  struct sockaddr_in addr;
  socklen_t size = sizeof(struct sockaddr_in);

  char buf[BUFSIZE];

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();

  ctx = SSL_CTX_new(DTLSv1_2_server_method());
  SSL_CTX_use_certificate_file(ctx, crt_file, SSL_FILETYPE_PEM);
  SSL_CTX_use_PrivateKey_file(ctx, key_file, SSL_FILETYPE_PEM);

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

