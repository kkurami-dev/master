/* -*- coding: utf-8-unix -*- */
#include <unistd.h>

#define DATA_NUM 5

const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   100,
   200,
   300,
   400,
   500,
   0
  };
int get_data( int count, char *type, char *msg )
{
  struct timeval tv;

  /* 送信ダー他の決定  */
  int no = ( count % RE_TRY );
  int idx = (int)( count / RE_TRY );
  int size = senddata_size[idx];

  /* 1つの送信データ送信完了 */
  if ( 0 != count && 0 == no ){
    printf("-,%s\n", type);
    usleep( 500000 );
  }
  /* 全ての計測用データ送信完了 */
  if ( DATA_NUM <= idx){
    return 0;
  }
  memset( msg, 0x00, BUFSIZE);
  memset( msg, 'A', senddata_size[idx] );

  /* 送信文字列の設定 */
  /* https://www.mm2d.net/main/prog/c/time-04.html  */
  gettimeofday(&tv, NULL);
  sprintf(msg, "%4d,%4s, %d,%ld.%06lu", no, type, size, tv.tv_sec, tv.tv_usec);
  printf("%29s", msg);

  return size;
}

int rcvprint( char *msg ){
  struct timeval tv;
  gettimeofday(&tv, NULL);
  printf("%29s,%ld.%06lu\n", msg, tv.tv_sec, tv.tv_usec);

  int no = 0;
  char type[128];
  int size = 0;
  sscanf( msg, "%4d,%s%d", &no, type, &size);
  //printf(":%d %s %d:", no, type, size);
  if((RE_TRY - 1) == no && senddata_size[DATA_NUM - 1] == size ){
    return 0;
  }
  
  usleep( 20000 );
  return 1;
}

void endprint( void ){
  struct timeval tv;
  gettimeofday(&tv, NULL);
  
  printf(",%ld.%06lu\n", tv.tv_sec, tv.tv_usec);
  
  usleep( 20000 );
}
