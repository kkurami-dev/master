#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
 
int main(int argc, char** argv)
{
    int sd;
    char msg[2048];
    struct sockaddr_in addr;
 
    // 送信先アドレスとポート番号を設定する
    // 受信プログラムと異なるあて先を設定しても UDP の場合はエラーにはならない
    addr.sin_family = AF_INET;
    addr.sin_port = htons(22222);
    addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    for(int i = 0; i < 10000; i++){
      sprintf(msg, "%5d aaaaaaaaaaaaaaaaa", i);

      /* 接続 */
      if((sd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("socket");
        return -1;
      }

      // パケットをUDPで送信
      if(sendto(sd, msg, 17, 0,
                (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("sendto");
        return -1;
      }
      close(sd);
    }
 
    return 0;
}
