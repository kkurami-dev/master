#include <stdio.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <openssl/err.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
//#include <openssl/applink.c>
#include <string>

#pragma comment(lib, "Ws2_32.lib")
struct DTLSStuff { //struct to contain DTLS object instances
  SSL_CTX *ctx;
  SSL *ssl;
  BIO *bio;
};

void DTLSErr() { //DTLS error reporting
  ERR_print_errors_fp(stderr);
  exit(1);
}

int newSocket(sockaddr_in addr) { //creates a socket and returns the file descriptor //TODO expand for multi-platform
  WSADATA wsaData;
  int fd;
  int iResult;
  iResult = WSAStartup(MAKEWORD(2, 2), &wsaData); //Initialize Winsock
  if (iResult != 0) { printf("WSAStartup failed: %d\n", iResult); exit(1); }
  fd = socket(AF_INET, SOCK_DGRAM, 0); if (fd < 0) { perror("Unable to create socket"); exit(1); } //create socket
  printf("New Socket: %i\n", fd);
  if (bind(fd, (struct sockaddr *)&addr, sizeof(sockaddr)) < 0) { printf("bind failed with error %u\n", WSAGetLastError()); exit(1); }
  return fd; //file descriptor
}

void InitCTX(SSL_CTX *ctx, bool IsClient) { //Takes a ctx object and initializes it for DTLS communication
  if (IsClient) {
    if(SSL_CTX_use_certificate_chain_file(ctx, "client-cert.pem") < 0) { printf("Failed loading client cert");}
    if(SSL_CTX_use_PrivateKey_file(ctx, "client-key.pem", SSL_FILETYPE_PEM) < 0) { printf("Failed loading client key"); }
  }
  else {
    if (SSL_CTX_use_certificate_chain_file(ctx, "server-cert.pem") < 0) { printf("Failed loading client cert"); }
    if (SSL_CTX_use_PrivateKey_file(ctx, "server-key.pem", SSL_FILETYPE_PEM) < 0) { printf("Failed loading client key"); }
  }
  //SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER, verify_cert); //omitted for testing
  //SSL_CTX_set_cookie_generate_cb(ctx, generate_cookie); //omitted for testing
  //SSL_CTX_set_cookie_verify_cb(ctx, verify_cookie); //omitted for testing
  SSL_CTX_set_read_ahead(ctx, 1);
}

int main() { //creates client and server sockets and DTLS objects. TODO: have client complete handshake with server socket and send a message and have the server echo it back to client socket
  BIO_ADDR *faux_addr = BIO_ADDR_new(); // for DTLSv1_listen(), since we are this is both client and server (meaning client address is known) it is only used to satisfy parameters.
  ERR_load_BIO_strings();
  SSL_load_error_strings();
  SSL_library_init();

  //Set up addresses
  sockaddr_in client_addr;
  client_addr.sin_family = AF_INET;
  client_addr.sin_port = htons(25501);
  client_addr.sin_addr.s_addr = INADDR_ANY;
  sockaddr_in server_addr;
  server_addr.sin_family = AF_INET;
  server_addr.sin_port = htons(25500);
  server_addr.sin_addr.s_addr = INADDR_ANY;

  //*********CLIENT
  DTLSStuff ClientInf;
  ClientInf.ctx = SSL_CTX_new(DTLSv1_client_method());
  InitCTX(ClientInf.ctx,true);
  int ClientFD = newSocket(client_addr);
  ClientInf.bio = BIO_new_dgram(ClientFD, BIO_NOCLOSE);
  ClientInf.ssl = SSL_new(ClientInf.ctx);
  //SSL_set_options(ClientInf.ssl, SSL_OP_COOKIE_EXCHANGE); //omitted for testing
  SSL_set_bio(ClientInf.ssl, ClientInf.bio, ClientInf.bio);

  //*********SERVER
  DTLSStuff ServerInf;
  ServerInf.ctx = SSL_CTX_new(DTLSv1_server_method());
  InitCTX(ServerInf.ctx,false);

  int ServerFD = newSocket(server_addr);
  ServerInf.bio = BIO_new_dgram(ServerFD, BIO_NOCLOSE);
  ServerInf.ssl = SSL_new(ServerInf.ctx);
  //SSL_set_options(ServerInf.ssl, SSL_OP_COOKIE_EXCHANGE); //omitted for testing
  SSL_set_bio(ServerInf.ssl, ServerInf.bio, ServerInf.bio);
  printf("Listen attempt...\n");

  int ret = DTLSv1_listen(ServerInf.ssl, faux_addr);
  if (ret < 0) { DTLSErr(); }
  printf("this print should occur, but it never does");
  exit(1);
}
