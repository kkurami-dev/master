/* -*- coding: utf-8-unix -*- */
#include <stdio.h> //printf(), fprintf(), perror()
#include <sys/socket.h> //socket(), bind(), accept(), listen()
#include <arpa/inet.h> // struct sockaddr_in, struct sockaddr, inet_ntoa(), inet_aton()
#include <stdlib.h> //atoi(), exit(), EXIT_FAILURE, EXIT_SUCCESS
#include <string.h> //memset(), strcmp()
#include <unistd.h> //close()
#include <poll.h> /* poll */

#include "common_data.h"

int main(int argc, char* argv[]) {

  int sock; //local socket descriptor
  struct sockaddr_in servSockAddr; //server internet socket address
  unsigned short servPort; //server port number
  char sendBuffer[BUFSIZE]; // send temporary buffer
  char log[128];
  int ret;

  struct pollfd fds[1] = {0};

  /* 接続情報の作成 */
  memset(&servSockAddr, 0, sizeof(servSockAddr));
  servSockAddr.sin_family = AF_INET;
  if (inet_aton(HOST_IP, &servSockAddr.sin_addr) == 0) {
    fprintf(stderr, "Invalid IP Address.\n");
    exit(EXIT_FAILURE);
  }
  if ((servPort = TLS_PORT) == 0) {
    fprintf(stderr, "invalid port number.\n");
    exit(EXIT_FAILURE);
  }
  servSockAddr.sin_port = htons(servPort);
  printf("connect to %s\n", inet_ntoa(servSockAddr.sin_addr));

  int i = 0;
  while(1){
    int size = get_data(i++, " tcp", sendBuffer, log);
    /* 計測終了 */
    if( 0 == size ){
      break;
    }

#if 0
    sock = get_settings_fd( HOST, SOCK_STREAM, TEST_SENDER, NULL);
#else
    /* 接続 */
    LOG(sock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP));
    if (sock < 0 ){
      fprintf(stderr, "sock:%d error:%d ", sock, errno);
      perror("socket() failed.");
      exit(EXIT_FAILURE);
    }

    LOG(ret = connect(sock, (struct sockaddr*) &servSockAddr, sizeof(servSockAddr)));
    if (ret < 0) {
      fprintf(stderr, "i:%d ret:%d error:%d ", i, ret, errno);
      perror("connect() failed.");
      exit(EXIT_FAILURE);
    }
#endif
#if (ONE_SEND == 1)
  re_send:
#endif // (ONE_SEND == 1)

#if 1
    /* 送信可能になるまでまつ */
    LOGS();
    fds[0].fd = sock;
    fds[0].events = POLLOUT;                // 書き込み可能イベントを設定
    while (1){
      ret = poll(fds, 1, 10);
      if (fds[0].revents & POLLERR){       // エラー発生
        fprintf(stderr, "ret:%d error:%d ", ret, errno);
        perror("poll() failed.");
        exit(EXIT_FAILURE);
      }
      else if (fds[0].revents & POLLOUT){  // 送信可能ならsend実施
        break;
      } else {
        fprintf(stderr, ".");
      }
    }
    LOGE(poll());
#endif
    /* 送信 */
    LOGS();
    while( 1 ){
      ret = send(sock, sendBuffer, size, 0);
      if( errno != EINTR ) break;
    }
    if (ret < 0) {
      fprintf(stderr, "ret:%d error:%d ", ret, errno);
      perror("send() failed.");
      exit(EXIT_FAILURE);
    }
    LOGE(send());

#if (SERVER_REPLY == 1)
    /* 受信 */
    int byteRcvd  = 0;
    char recvBuffer[BUFSIZE];//receive temporary buffer
    LOG(byteRcvd = recv(sock, recvBuffer, BUFSIZE, 0));
    if (byteRcvd > 0) {
    } else if(byteRcvd == 0){
      perror("ERR_EMPTY_RESPONSE");
      exit(EXIT_FAILURE);
    } else {
      perror("recv() failed. ");
      exit(EXIT_FAILURE);
    }
#endif // (SERVER_REPLY == 1)

#if (ONE_SEND == 1)
    if(i % RE_TRY){
      endprint(log);
      size = get_data(i++, " tcp", sendBuffer, log);
      goto re_send;
    }
#endif // (ONE_SEND == 1)

    LOG(shutdown(sock, 1));
    LOG(close(sock));
    endprint(log);
  }

  return EXIT_SUCCESS;
}
// SO_LINGER
// SO_REUSEADDR
