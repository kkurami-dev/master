/* -*- coding: utf-8-unix -*- */
#include <unistd.h>

#define DATA_NUM 5

int get_data( int count, char *type, char *msg )
{
  const int senddata_size[] =
    {
     /* 送信データ  */
   100,
   200,
   300,
   400,
   500,
   0
  };
  struct timeval tv;

  /* 送信ダー他の決定  */
  int no = ( count % RE_TRY );
  int idx = (int)( count / RE_TRY );
  int size = senddata_size[idx];

  /* 1つの送信データ送信完了 */
  if ( 0 != count && 0 == no ){
    printf("-\n");
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
  sprintf(msg, "%4d,%s,%4d,%ld.%06lu", no, type, size, tv.tv_sec, tv.tv_usec);
  printf("%28s", msg);

  return size;
}

void rcvprint( char *msg ){
  struct timeval tv;
  gettimeofday(&tv, NULL);
  
  printf("%28s,%ld.%06lu\n", msg, tv.tv_sec, tv.tv_usec);
  
  usleep( 20000 );
}

void endprint( void ){
  struct timeval tv;
  gettimeofday(&tv, NULL);
  
  printf(",%ld.%06lu\n", tv.tv_sec, tv.tv_usec);
  
  usleep( 20000 );
}
