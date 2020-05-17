#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include <openssl/ssl.h>
#include <openssl/err.h>

#include "common_data.h"

int main(void)
{
  int mysocket;
  struct sockaddr_in server;

  SSL *ssl;
  SSL_CTX *ctx;

  char msg[BUFSIZE];

  int port = 8765;

  char buf[BUFSIZE + 1];
  int read_size;

  memset(&server, 0, sizeof(server));
  server.sin_family = AF_INET;
  server.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  server.sin_port = htons(port);
  //sockaddr_in server = SOCKADDR_IN_INIT( AF_INET, htons(port), InAddr(HOST_IP) );

  int i = 0;
  while(1){
    int size = get_data(i++, " ssl", msg );
    if ( 0 == size ){
      break;
    }

    mysocket = socket(AF_INET, SOCK_STREAM, 0); 
    connect(mysocket, (struct sockaddr*) &server, sizeof(server));
 
    SSL_load_error_strings();
    SSL_library_init();

    ctx = SSL_CTX_new(SSLv23_client_method());
    ssl = SSL_new(ctx);
    SSL_set_fd(ssl, mysocket);
    int retval = SSL_connect(ssl);
    if ( retval <= 0 ){
      fprintf(stderr, "SSL_connect failed with %d\n", retval);
      exit(EXIT_FAILURE);
    }

    SSL_write(ssl, msg, size);
    do {
      read_size = SSL_read(ssl, buf, BUFSIZE);
    } while (read_size > 0);

    SSL_shutdown(ssl); 

    SSL_free(ssl); 
    SSL_CTX_free(ctx);
    ERR_free_strings();

    close(mysocket);

    endprint();
  }

  return EXIT_SUCCESS;
}


