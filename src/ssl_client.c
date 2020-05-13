#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include <openssl/ssl.h>
#include <openssl/err.h>

int main(void)
{
  int mysocket;
  struct sockaddr_in server;

  SSL *ssl;
  SSL_CTX *ctx;

  char msg[100];

  char *host = "localhost";
  char *path = "/";
  int port = 8765;

  memset(&server, 0, sizeof(server));
  server.sin_family = AF_INET;
  server.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  server.sin_port = htons(port);

  mysocket = socket(AF_INET, SOCK_STREAM, 0); 
  
  connect(mysocket, (struct sockaddr*) &server, sizeof(server));
 
  SSL_load_error_strings();
  SSL_library_init();

  ctx = SSL_CTX_new(SSLv23_client_method());
  ssl = SSL_new(ctx);
  SSL_set_fd(ssl, mysocket);
  SSL_connect(ssl);

  sprintf(
    msg, 
    "GET %s HTTP/1.0\r\nHost: %s\r\n\r\n",
    path,
    host
  );

  SSL_write(ssl, msg, strlen(msg));

  int buf_size = 256;
  char buf[buf_size];
  int read_size;

  do {
    read_size = SSL_read(ssl, buf, buf_size);
    printf("%s", buf);
  } while (read_size > 0);

  SSL_shutdown(ssl); 

  SSL_free(ssl); 
  SSL_CTX_free(ctx);
  ERR_free_strings();

  close(mysocket);

  return EXIT_SUCCESS;
}


