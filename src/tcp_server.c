#include <stdio.h> //printf(), fprintf(), perror()
#include <sys/socket.h> //socket(), bind(), accept(), listen()
#include <arpa/inet.h> // struct sockaddr_in, struct sockaddr, inet_ntoa()
#include <stdlib.h> //atoi(), exit(), EXIT_FAILURE, EXIT_SUCCESS
#include <string.h> //memset()
#include <unistd.h> //close()

#include "common_data.h"

void connection_handle( int clitSock, SSL *ssl ){
  char recvBuffer[BUFSIZE];//receive temporary buffer
  int recvMsgSize; // recieve and send buffer size
  int ret;

  while(1) {
    LOGR(recvMsgSize = recv(clitSock, recvBuffer, BUFSIZE, 0));
    if (recvMsgSize < 0) {
      perror("recv() failed.");
      exit(EXIT_FAILURE);
    } else if(recvMsgSize == 0){
      break;
    }

#if (SERVER_REPLY == 1)
    int sendMsgSize;
    LOGR(sendMsgSize = send(clitSock, "ack", 4, 0));
    if(sendMsgSize < 0){
      perror("send() failed.");
      exit(EXIT_FAILURE);
    } else if(sendMsgSize == 0){
      break;
    }
#endif // (SERVER_REPLY == 1)

    ret = rcvprint( recvBuffer );
    if( ret == 0 ) {
      break;
    }

#if (ONE_SEND == 0)
    break;
#endif // (ONE_SEND == 0)
  }

  LOGR(shutdown(clitSock, 1));
  LOGR(close(clitSock));
}

int main(int argc, char* argv[]) {

  int servSock; //server socket descriptor
  int clitSock; //client socket descriptor
  struct sockaddr_in servSockAddr; //server internet socket address
  struct sockaddr_in clitSockAddr; //client internet socket address
  unsigned short servPort; //server port number
  unsigned int clitLen; // client internet socket address length
  //const int on = 1, off = 0;
  const int on = 1;

  if ((servPort = TLS_PORT) == 0) {
    fprintf(stderr, "invalid port number.\n");
    exit(EXIT_FAILURE);
  }

  if ((servSock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP)) < 0 ){
    perror("socket() failed.");
    exit(EXIT_FAILURE);
  }

  memset(&servSockAddr, 0, sizeof(servSockAddr));
  servSockAddr.sin_family      = AF_INET;
  servSockAddr.sin_addr.s_addr = htonl(INADDR_ANY);
  servSockAddr.sin_port        = htons(servPort);

  setsockopt(servSock, SOL_SOCKET, SO_LINGER, (const void*) &on, (socklen_t) sizeof(on));
  setsockopt(servSock, SOL_SOCKET, SO_REUSEADDR, (const void*) &on, (socklen_t) sizeof(on));
  if (bind(servSock, (struct sockaddr *) &servSockAddr, sizeof(servSockAddr) ) < 0 ) {
    perror("bind() failed.");
    exit(EXIT_FAILURE);
  }
  LOGR(listen(servSock, QUEUELIMIT));

  clitLen = sizeof(clitSockAddr);

  struct thdata *th = sock_thread_create( connection_handle );
  while(1) {
    LOGR(clitSock = accept(servSock, (struct sockaddr *) &clitSockAddr, &clitLen));
    sock_thread_post( th, clitSock, NULL );
  }
  sock_thread_join( th );

  close(servSock);
  return EXIT_SUCCESS;
}
