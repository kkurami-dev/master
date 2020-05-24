/* -*- coding: utf-8-unix -*- */
#include <unistd.h>

//#define TIME_MAX (long)(3600)
#define TIME_MAX (long) ( 600 )

#if (TEST == 1)
#define DATA_NUM  2
const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   //35200	,
   10000	, 100, 0
  };
#else
#define DATA_NUM  23
const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   //35200	,
   16383	,
   16384	,
   16385	,
   6388	,
   6390	,
   7000	,
   5000	,
   2200	,
   4400	,
   8800	,
   //17600	,
   10100	,
   101	,
   302	,
   503	,
   704	,
   905	,
   1106	,
   2208	,
   4409	,
   8801	,
   //17602	,
   10300	,
   //35203	,
   10010	,
   999,
   0
  };
#endif

int snd_count = 0;
int rcv_count = 0;

/* 
 * 経過時刻の計算
 * timeval構造体の差分計算（最大１日の差分まで出す)
 */
struct timeval diff_time( struct timeval *tv_s, struct timeval *tv_e){
  struct timeval tv;
  long tmp_s;
  long tmp_e;

  tmp_s = ((tv_s->tv_sec % TIME_MAX) * 1000000) + tv_s->tv_usec;
  tmp_e = ((tv_e->tv_sec % TIME_MAX) * 1000000) + tv_e->tv_usec;
  if (tmp_e > tmp_s){
    tmp_s = tmp_e - tmp_s;
  } else {
    tmp_s = tmp_e + ((TIME_MAX * 1000000) - tmp_s);
  }
  tv.tv_sec  = (long)(tmp_s / 1000000);
  tv.tv_usec = tmp_s % 1000000;
  return tv;
}

/*
 * 処理終了時に呼び出し関数の処理時間を表示する
 */
void time_log(int line, char *msg){
  struct timeval tv_e;
  struct timeval tv;
  gettimeofday(&tv_e, NULL);
  tv = diff_time( &tv_s, &tv_e );
  printf("% 4ld.%06lu,% 2ld.%06lu,%4d:%s\n",
         (tv_e.tv_sec % TIME_MAX), tv_e.tv_usec, tv.tv_sec, tv.tv_usec, line, msg);
}

/* 
 * 送信メッセージ作成と送信開始時間の記録
 */
int get_data( int count, char *type, char *msg, char *log )
{
  struct timeval tv;

  /* 送信ダー他の決定  */
  int no = ( count % RE_TRY );
  int idx = (int)( count / RE_TRY );
  int size = senddata_size[idx];
  char buf[ 256 ];

  /* 1つの送信データ送信完了 */
  //if ( 0 == count ) printf("No.,type,msg size, start time, end time\n");
  if ( 0 != count && 0 == no ){
    fprintf(stderr, "end : %s, %d snd:%d\n", type, senddata_size[idx - 1], snd_count);
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
  sprintf(buf, "%4d,%4s, %6d,% 4ld.%06lu", no, type, size, (tv.tv_sec % TIME_MAX), tv.tv_usec);
  sprintf(log, "%.30s", buf);
  strncpy(msg, buf, strlen(buf));

  return size;
}

/* 
 * メッセージ受信受診後のログだし
 */
int rcvprint( char *msg ){
  struct timeval tv, tv_s;
  int no = 0;
  char type[128];
  int size = 0;

  gettimeofday(&tv, NULL);
  sscanf( msg, "%4d,%s%d,%ld.%06lu", &no, type, &size, &(tv_s.tv_sec), &(tv_s.tv_usec));
  tv_s = diff_time( &tv_s, &tv );
  printf("% 4ld.%06lu,% 2ld.%06lu,%.29s\n", (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, msg);

  msg[ size + 1] = '\n';
  //printf(":%d %s %d:", no, type, size);
  if((RE_TRY - 1) == no) {
    fprintf(stderr, "end : %s%d rcv:%d\n", type, size, rcv_count);
    if(senddata_size[DATA_NUM - 1] == size ){
      return 0;
    }
  }

  if(strlen(msg) > 0) ++rcv_count;

  usleep( TIME_WAIT );
  return 1;
}

/* 
 * メッセージ送信完了後のログだし
 */
void endprint( char *log ){
  struct timeval tv, tv_s;
  gettimeofday(&tv, NULL);
  char dummy[256];
  int i;

  if(strlen(log) > 0) ++snd_count;

  sscanf( log, "%18s%d,%ld.%06lu", dummy, &i, &(tv_s.tv_sec), &(tv_s.tv_usec));
  tv_s = diff_time( &tv_s, &tv );
  printf("% 4ld.%06lu,% 2ld.%06lu,%s\n", (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, log);

  usleep( TIME_WAIT + NEXT_SEND_WAIT );
}

/* 
 * SSL通信時認証判定関数(常にOKを出している)
 */
int verify_callback(int ok, X509_STORE_CTX *ctx) {
	/* This function should ask the user if he trusts the received certificate. Here we always trust.
   * この関数は、ユーザーが受信した証明書を信頼しているかどうかをユーザーに確認する必要があります。
   * ここでは常に信頼しています。
   */
	return 1;
}

void ssl_ret_check( int ret, int line, const char *msg ){
  if ( 1 == ret ) return;

  fprintf(stderr, "%d :%d errno:%d\n", line, ret, errno );
  perror(msg);
  exit(EXIT_FAILURE);
}

int ssl_read_error(SSL *ssl, int len ){
  if(len > 0){
    return 0;
  }
  int reading = SSL_get_error(ssl, len);
  switch (reading) {
  case SSL_ERROR_NONE:
    reading = 0;
    break;
  case SSL_ERROR_WANT_READ:
  case SSL_ERROR_ZERO_RETURN:
    fprintf(stderr, "Socket read warn: re try\n");
    reading = 1;
    break;
  case SSL_ERROR_SYSCALL:
    fprintf(stderr, "Socket read (SSL_ERROR_SYSCALL) errno:%d\n", errno);
    if (!errno) exit(1);
    reading = 1;
    break;
  case SSL_ERROR_SSL:
    fprintf(stderr, "SSL read error:%ld (%d) errno:%d\n", ERR_get_error(), reading, errno);
    exit(1);
    break;
  default:
    fprintf(stderr, "Unexpected error while reading!: %d errno:%d\n", reading, errno);
    exit(1);
    break;
  }

  return reading;
}

int ssl_get_accept(SSL *ssl, int sslret){
  if(sslret >= 0){
    return 0;
  }
  int ssl_eno = SSL_get_error(ssl, sslret);
  switch (ssl_eno)
    {
    case SSL_ERROR_NONE:
      return 0;
    case SSL_ERROR_WANT_READ:
    case SSL_ERROR_WANT_WRITE:
    case SSL_ERROR_SYSCALL:
      return 1;
    default:
      // エラー処理
      fprintf(stderr, "%ld (%d)\n", ERR_get_error(),ssl_eno );
      exit(1);
    }
}
