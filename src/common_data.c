/* -*- coding: utf-8-unix -*- */
#include <unistd.h>

#define DATA_NUM  23
#define TIME_MAX (3600 * 24)

const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   35200	,
   100	,
   300	,
   500	,
   700	,
   900	,
   1100	,
   2200	,
   4400	,
   8800	,
   17600	,
   101	,
   302	,
   503	,
   704	,
   905	,
   1106	,
   2208	,
   4409	,
   8801	,
   17602	,
   35203	,
   999,
   0
  };

void time_log(int line, char *msg){
  struct timeval tv_e;
  struct timeval tv;
  gettimeofday(&tv_e, NULL);
  tv.tv_sec = tv_e.tv_sec - tv_s.tv_sec;
  tv.tv_usec = tv_e.tv_usec > tv_s.tv_usec ? tv_e.tv_usec - tv_s.tv_usec : tv_e.tv_usec;
  printf("%ld.%06lu,%ld.%06lu,%4d:%s\n",
         (tv_e.tv_sec % TIME_MAX), tv_e.tv_usec, tv.tv_sec, tv.tv_usec, line, msg);
}

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
    fprintf(stderr, "end : %s, %d\n", type, senddata_size[idx - 1]);
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
  sprintf(buf, "%4d,%4s, %6d,%ld.%06lu", no, type, size, (tv.tv_sec % TIME_MAX), tv.tv_usec);
  sprintf(log, "%.30s", buf);
  strncpy(msg, buf, strlen(buf));

  return size;
}

int rcvprint( char *msg ){
  struct timeval tv, tv_s;
  int no = 0;
  char type[128];
  int size = 0;

  gettimeofday(&tv, NULL);
  sscanf( msg, "%4d,%s%d,%ld.%06lu", &no, type, &size, &(tv_s.tv_sec), &(tv_s.tv_usec));
  tv.tv_sec = (tv.tv_sec % TIME_MAX);
  tv_s.tv_sec = tv.tv_sec - tv_s.tv_sec;
  tv_s.tv_usec = tv.tv_usec > tv_s.tv_usec ? tv.tv_usec - tv_s.tv_usec : tv.tv_usec;
  printf("%ld.%06lu,%ld.%06lu,%.29s\n", tv.tv_sec, tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, msg);

  msg[ size + 1] = '\n';
  //printf(":%d %s %d:", no, type, size);
  if((RE_TRY - 1) == no) {
    fprintf(stderr, "end : %s%d\n", type, size);
    if(senddata_size[DATA_NUM - 1] == size ){
      fprintf(stderr, "all end : %s%d\n", type, size);
      return 0;
    }
  }

  usleep( TIME_WAIT );
  return 1;
}

void endprint( char *log ){
  struct timeval tv, tv_s;
  gettimeofday(&tv, NULL);
  char dummy[256];
  int i;

  sscanf( log, "%18s%d,%ld.%06lu", dummy, &i, &(tv_s.tv_sec), &(tv_s.tv_usec));
  tv.tv_sec = (tv.tv_sec % TIME_MAX);
  tv_s.tv_sec = tv.tv_sec - tv_s.tv_sec;
  tv_s.tv_usec = tv.tv_usec > tv_s.tv_usec ? tv.tv_usec - tv_s.tv_usec : tv.tv_usec;
  printf("%ld.%06lu,%ld.%06lu,%s\n", tv.tv_sec, tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, log);

  usleep( TIME_WAIT + 30000 );
}

int verify_callback(int ok, X509_STORE_CTX *ctx) {
	/* This function should ask the user if he trusts the received certificate. Here we always trust.
   * この関数は、ユーザーが受信した証明書を信頼しているかどうかをユーザーに確認する必要があります。
   * ここでは常に信頼しています。
   */
	return 1;
}

#define ssl_get_error ssl_bioread_error
int ssl_bioread_error(SSL *ssl, int len ){
  int reading = 1;
  if(len > 0){
    return reading;
  }
  reading = SSL_get_error(ssl, len);
  switch (reading) {
  case SSL_ERROR_NONE:
    reading = 1;
    break;
  case SSL_ERROR_WANT_READ:
    /* Stop reading on socket timeout, otherwise try again */
    if (BIO_ctrl(SSL_get_rbio(ssl), BIO_CTRL_DGRAM_GET_RECV_TIMER_EXP, 0, NULL)) {
      printf("Timeout! No response received.\n");
      reading = -1;
    }
    break;
  case SSL_ERROR_ZERO_RETURN:
    reading = 0;
    break;
  case SSL_ERROR_SYSCALL:
    printf("Socket read error: ");
    if (!errno) exit(1);
    reading = 0;
    break;
  case SSL_ERROR_SSL:
    printf("SSL read error: ");
    printf("%ld (%d)\n", ERR_get_error(), reading);
    reading = -1;
    break;
  default:
    fprintf(stderr, "Unexpected error while reading!\n");
    reading = -1;
    break;
  }
  return reading;
}

void ssl_ret_check( int ret, int line, const char *msg ){
  if ( 1 == ret ) return;

  fprintf(stderr, "%d :%d errno:%d\n", line, ret, errno );
  perror(msg);
  exit(EXIT_FAILURE);
}

int ssl_write_error(SSL *ssl, int len ){
  if(len > 0){
    return 0;
  }
  int reading = SSL_get_error(ssl, len);
  switch (reading) {
  case SSL_ERROR_NONE:
    reading = 0;
    break;
  case SSL_ERROR_WANT_WRITE:
  case SSL_ERROR_ZERO_RETURN:
    reading = 1;
    break;
  case SSL_ERROR_SYSCALL:
    fprintf(stderr, "\nSocket write error: %d", errno);
    if (!errno) exit(1);
    reading = 1;
    break;
  case SSL_ERROR_SSL:
    fprintf(stderr, "\nSSL read error: %ld (%d) errno:%d\n", ERR_get_error(), SSL_get_error(ssl, len), errno);
    exit(1);
    break;
  default:
    fprintf(stderr, "\nUnexpected error while writeing!: %d errno:%d\n", reading, errno);
    exit(1);
    break;
  }

  return reading;
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
