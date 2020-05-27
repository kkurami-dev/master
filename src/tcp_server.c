#include <stdio.h> //printf(), fprintf(), perror()
#include <sys/socket.h> //socket(), bind(), accept(), listen()
#include <arpa/inet.h> // struct sockaddr_in, struct sockaddr, inet_ntoa()
#include <stdlib.h> //atoi(), exit(), EXIT_FAILURE, EXIT_SUCCESS
#include <string.h> //memset()
#include <unistd.h> //close()

#define QUEUELIMIT 5

#include "common_data.h"

int main(int argc, char* argv[]) {

  int servSock; //server socket descriptor
  int clitSock; //client socket descriptor
  struct sockaddr_in servSockAddr; //server internet socket address
  struct sockaddr_in clitSockAddr; //client internet socket address
  unsigned short servPort; //server port number
  unsigned int clitLen; // client internet socket address length
  char recvBuffer[BUFSIZE];//receive temporary buffer
  int recvMsgSize; // recieve and send buffer size
  int ret;

  /* if ( argc != 2) { */
  /*     fprintf(stderr, "argument count mismatch error.\n"); */
  /*     exit(EXIT_FAILURE); */
  /* } */

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

  if (bind(servSock, (struct sockaddr *) &servSockAddr, sizeof(servSockAddr) ) < 0 ) {
    perror("bind() failed.");
    exit(EXIT_FAILURE);
  }

  LOG(listen(servSock, 10));

  while(1) {
    clitLen = sizeof(clitSockAddr);
    LOG(clitSock = accept(servSock, (struct sockaddr *) &clitSockAddr, &clitLen));

    while(1) {
      LOG(ret = (recvMsgSize = recv(clitSock, recvBuffer, BUFSIZE, 0)));
      if (ret < 0) {
        perror("recv() failed.");
        exit(EXIT_FAILURE);
      } else if(recvMsgSize == 0){
        break;
      }

#if (SERVER_REPLY == 1)
      int sendMsgSize;
      LOG(sendMsgSize = send(clitSock, "ack", 4, 0));
      if(sendMsgSize < 0){
        perror("send() failed.");
        exit(EXIT_FAILURE);
      } else if(sendMsgSize == 0){
        break;
      }
#endif // (SERVER_REPLY == 1)

      ret = rcvprint( recvBuffer );
      if( ret == 0 ) {
        close(servSock);
        return EXIT_SUCCESS;
      }

#if (ONE_SEND == 0)
      break;
#endif // (ONE_SEND == 0)
    }

    LOG(close(clitSock));
  }

  close(servSock);
  return EXIT_SUCCESS;
}
