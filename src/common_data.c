/* -*- coding: utf-8-unix -*- */
#include <unistd.h>

#define DATA_NUM 24
#define TIME_MAX (3600 * 24)

const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   70400	,
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
   35200	,
   70401	,
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
   0
  };

void time_log(int line, char *msg){
  struct timeval tv_e;
  struct timeval tv;
  gettimeofday(&tv_e, NULL);
  tv.tv_sec = tv_e.tv_sec - tv_s.tv_sec;
  tv.tv_usec = tv_e.tv_usec - tv_s.tv_usec;
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
    fprintf(stderr, "end : %s%d\n", type, senddata_size[idx - 1]);
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
  struct timeval tv;
  gettimeofday(&tv, NULL);
  printf("%.30s,%ld.%06lu\n", msg, (tv.tv_sec % TIME_MAX), tv.tv_usec);

  int no = 0;
  char type[128];
  int size = 0;
  sscanf( msg, "%4d,%s%d", &no, type, &size);
  msg[ size + 1] = '\n';
  //printf(":%d %s %d:", no, type, size);
  if((RE_TRY - 1) == no) {
    fprintf(stderr, "end : %s%d\n", type, size);
  }
  if((RE_TRY - 1) == no && senddata_size[DATA_NUM - 1] == size ){
    return 0;
  }
  
  usleep( TIME_WAIT );
  return 1;
}

void endprint( char *log ){
  struct timeval tv;
  gettimeofday(&tv, NULL);
  
  printf("%s,%ld.%06lu\n", log, (tv.tv_sec % TIME_MAX), tv.tv_usec);
  
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
  int reading = 0;
  switch (SSL_get_error(ssl, len)) {
  case SSL_ERROR_NONE:
    reading = 0;
    break;
  case SSL_ERROR_WANT_READ:
    /* Stop reading on socket timeout, otherwise try again */
    if (BIO_ctrl(SSL_get_rbio(ssl), BIO_CTRL_DGRAM_GET_RECV_TIMER_EXP, 0, NULL)) {
      printf("Timeout! No response received.\n");
      reading = 0;
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
    printf("%ld (%d)\n", ERR_get_error(), SSL_get_error(ssl, len));
    exit(1);
    break;
  default:
    printf("Unexpected error while reading!\n");
    exit(1);
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
    fprintf(stderr, "\n\nSocket write error: \n\n");
    if (!errno) exit(1);
    reading = 1;
    break;
  case SSL_ERROR_SSL:
    fprintf(stderr, "\nSSL read error: %ld (%d)\n\n", ERR_get_error(), SSL_get_error(ssl, len));
    exit(1);
    break;
  default:
    fprintf(stderr, "\nUnexpected error while writeing!: %d\n\n", reading);
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
    fprintf(stderr, "\n\nSocket read error: \n\n");
    if (!errno) exit(1);
    reading = 1;
    break;
  case SSL_ERROR_SSL:
    fprintf(stderr, "\nSSL read error:%ld (%d)\n\n", ERR_get_error(), reading);
    exit(1);
    break;
  default:
    fprintf(stderr, "\nUnexpected error while reading!: %d\n\n", reading);
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
