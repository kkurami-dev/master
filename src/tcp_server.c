#include <stdio.h> //printf(), fprintf(), perror()
#include <sys/socket.h> //socket(), bind(), accept(), listen()
#include <arpa/inet.h> // struct sockaddr_in, struct sockaddr, inet_ntoa()
#include <stdlib.h> //atoi(), exit(), EXIT_FAILURE, EXIT_SUCCESS
#include <string.h> //memset()
#include <unistd.h> //close()

#include "common_data.h"

int connection_handle( struct thdata * priv ){
  int clitSock = priv->sock;
  char recvBuffer[BUFSIZE];//receive temporary buffer
  int recvMsgSize; // recieve and send buffer size

  while(1) {
    while(1){
      LOG(recvMsgSize = recv(clitSock, recvBuffer, BUFSIZE, 0));
      if (recvMsgSize < 0) {
        perror("recv() failed.");
        exit(EXIT_FAILURE);
      } else if(recvMsgSize > 0){
        break;
      }
    }

#if (SERVER_REPLY == 1)
    int sendMsgSize;
    LOG(sendMsgSize = send(clitSock, "ack", 4, 0));
    if(sendMsgSize < 0){
      perror("send() failed.");
      exit(EXIT_FAILURE);
    } else if(sendMsgSize == 0){
      DEBUG( fprintf(stderr, "send error size:0 error:%d\n", errno) );
      break;
    }
#endif // (SERVER_REPLY == 1)


#if (ONE_SEND == 1)
    ret = rcvprint( recvBuffer );
    if( 0 == (ret % RE_TRY)) {
      break;
    }
#else
    break;
#endif // (ONE_SEND == 0)
  }

  //LOG(shutdown(clitSock, 1));
  LOG(close(clitSock));
  int ret = rcvprint( recvBuffer );
  DEBUG0( fprintf(stderr, "end ret:%d errno:%d\n", ret, errno) );
  if (ret)
    return 0;
  else
    return 1;
}

int main(int argc, char* argv[]) {

  int servSock; //server socket descriptor
  int clitSock; //client socket descriptor
  struct sockaddr_in servSockAddr; //server internet socket address
  //struct sockaddr_in clitSockAddr; //client internet socket address
  unsigned short servPort; //server port number
  //unsigned int clitLen; // client internet socket address length
  //const int on = 1, off = 0;
  const int on = 1;

  set_argument( argc, argv );

#if 1
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
#if (SETSOCKOPT == 1)
  setsockopt(servSock, SOL_SOCKET, SO_LINGER, (const void*) &on, (socklen_t) sizeof(on));
  setsockopt(servSock, SOL_SOCKET, SO_REUSEADDR, (const void*) &on, (socklen_t) sizeof(on));
  setsockopt(servSock, SOL_SOCKET, SO_REUSEPORT, (const void*) &on, (socklen_t) sizeof(on));
#endif
  if (bind(servSock, (struct sockaddr *) &servSockAddr, sizeof(servSockAddr) ) < 0 ) {
    perror("bind() failed.");
    exit(EXIT_FAILURE);
  }
  LOG(listen(servSock, QUEUELIMIT));
#else // 1
  servSock = get_settings_fd( NULL, SOCK_STREAM, TEST_RECEIVER, NULL);
#endif // 1
  //clitLen = sizeof(clitSockAddr);

  struct thdata *th = sock_thread_create( connection_handle );
  void *ssl; ssl = (void *)th;
  while(1) {
    LOG(clitSock = accept(servSock, NULL, NULL));
    if( sock_thread_post( th, clitSock, (SSL *)ssl )  ) break;
  }
  sock_thread_join( th );

  close(servSock);
  return EXIT_SUCCESS;
}
