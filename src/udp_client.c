#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include "common_data.h"

int main(int argc, char** argv)
{
  int sd, ret;
    char msg[BUFSIZE];
    char log[128];
    struct sockaddr_in addr;
 
    // 送信先アドレスとポート番号を設定する
    // 受信プログラムと異なるあて先を設定しても UDP の場合はエラーにはならない
    addr.sin_family = AF_INET;
    addr.sin_port = htons(TLS_PORT);
    addr.sin_addr.s_addr = inet_addr( HOST_IP );

    int i = 0;
    while(1){
      int size = get_data(i++, " udp", msg, log);
      if( 0 == size ){
        break;
      }

      /* 接続 */
      LOG(sd = socket(AF_INET, SOCK_DGRAM, 0));
      if( sd < 0) {
        perror("socket");
        return -1;
      }

      // パケットをUDPで送信
      do {
        LOG( ret = sendto(sd, msg, size, 0,
                          (struct sockaddr *)&addr, sizeof(addr)));
        if( ret < 0) {
          perror("sendto");
          return -1;
        }

#if (ONE_SEND == 1)
        endprint(log);
        size = get_data(i++, " udp", msg, log);
        if( 0 == size ){
          break;
        }
#else
        break;
#endif
      } while(1);

      LOG(close(sd));
      endprint(log);
    }
 
    return 0;
}
