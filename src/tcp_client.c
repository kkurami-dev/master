#include <stdio.h> //printf(), fprintf(), perror()
#include <sys/socket.h> //socket(), bind(), accept(), listen()
#include <arpa/inet.h> // struct sockaddr_in, struct sockaddr, inet_ntoa(), inet_aton()
#include <stdlib.h> //atoi(), exit(), EXIT_FAILURE, EXIT_SUCCESS
#include <string.h> //memset(), strcmp()
#include <unistd.h> //close()

#define MSGSIZE 1024
#define BUFSIZE (MSGSIZE + 1)

int main(int argc, char* argv[]) {

  int sock; //local socket descriptor
  struct sockaddr_in servSockAddr; //server internet socket address
  unsigned short servPort; //server port number
  char recvBuffer[BUFSIZE];//receive temporary buffer
  char sendBuffer[BUFSIZE]; // send temporary buffer
  char host[] = "127.0.0.1";
  char port[] = "1443";

  /* if (argc != 3) { */
  /*     fprintf(stderr, "argument count mismatch error.\n"); */
  /*     exit(EXIT_FAILURE); */
  /* } */

  memset(&servSockAddr, 0, sizeof(servSockAddr));

  servSockAddr.sin_family = AF_INET;

  if (inet_aton(host, &servSockAddr.sin_addr) == 0) {
    fprintf(stderr, "Invalid IP Address.\n");
    exit(EXIT_FAILURE);
  }
  if ((servPort = (unsigned short) atoi(port)) == 0) {
    fprintf(stderr, "invalid port number.\n");
    exit(EXIT_FAILURE);
  }
  servSockAddr.sin_port = htons(servPort);
  printf("connect to %s\n", inet_ntoa(servSockAddr.sin_addr));

  sprintf(
          sendBuffer,
          "GET %s HTTP/1.0\r\nHost: %s\r\n\r\n",
          port,
          host
          );

  for(int i = 0; i < 100; i++){
    /* 接続 */
    if ((sock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP)) < 0 ){
      perror("socket() failed.");
      exit(EXIT_FAILURE);
    }
    if (connect(sock, (struct sockaddr*) &servSockAddr, sizeof(servSockAddr)) < 0) {
      perror("connect() failed.");
      exit(EXIT_FAILURE);
    }

    /* 送信 */
    if (send(sock, sendBuffer, strlen(sendBuffer), 0) <= 0) {
      perror("send() failed.");
      exit(EXIT_FAILURE);
    }

    /* 受信 */
    int byteRcvd  = 0;
    byteRcvd = recv(sock, recvBuffer, BUFSIZE, 0);
    if (byteRcvd > 0) {
      close(sock);
    } else if(byteRcvd == 0){
      perror("ERR_EMPTY_RESPONSE");
      exit(EXIT_FAILURE);
    } else {
      perror("recv() failed. ");
      exit(EXIT_FAILURE);
    }
    //printf("server return: %s\n", recvBuffer);
  }

  return EXIT_SUCCESS;
}
