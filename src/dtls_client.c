#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>
#include <openssl/rand.h>
#include <openssl/dtls1.h>

#include "common_data.h"

int main(void)
{
  int mysocket;
  struct sockaddr_in server;

  SSL *ssl;
  SSL_CTX *ctx;
  char msg[BUFSIZE];
  int port = 32323;

  memset(&server, 0, sizeof(server));
  server.sin_family = AF_INET;
  if (inet_aton(HOST_IP, &server.sin_addr) == 0) {
    fprintf(stderr, "Invalid IP Address.\n");
    exit(EXIT_FAILURE);
  }
  //server.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  server.sin_port = htons(port);
  //sockaddr_in server = SOCKADDR_IN_INIT( AF_INET, htons(port), InAddr(HOST_IP) );

  int i = 0;
  while(1){
    int size = get_data(i++, "dtls", msg );
    if ( 0 == size ){
      break;
    }

    mysocket = socket(AF_INET, SOCK_STREAM, 0); 
    connect(mysocket, (struct sockaddr*) &server, sizeof(server));
 
    SSL_load_error_strings();
    SSL_library_init();

    ctx = SSL_CTX_new(DTLSv1_2_client_method());
    ssl = SSL_new(ctx);
    SSL_set_fd(ssl, mysocket);
    SSL_connect(ssl);

    SSL_write(ssl, msg, size);

    SSL_shutdown(ssl);

    SSL_free(ssl); 
    SSL_CTX_free(ctx);
    ERR_free_strings();

    close(mysocket);

    endprint();
  }

  return EXIT_SUCCESS;
}


