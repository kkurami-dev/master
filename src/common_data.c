/* -*- coding: utf-8-unix -*- */
#include <unistd.h>
#include <openssl/rand.h>

#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include <semaphore.h>
#include <pthread.h>

#define TIME_MAX (long)(3600)
//#define TIME_MAX (long) ( 600 )
#define TIME_FMT  "% 5ld.%06lu"

#define COOKIE_SECRET_LENGTH 16

#if (TEST == 1)
#define DATA_NUM  2
const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   16384,
   100,
   0 // 終了判定ダミーデータ
  };

#else // (TEST == 1)
#define DATA_NUM  22
const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   //35200	,
   16383	,
   16384	,
   //16385	, /* このデータサイズは DTLS でエラーになる */
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
   0 // 終了判定ダミーデータ
  };
#endif // (TEST == 1)

int snd_count = 0;
int rcv_count = 0;

unsigned char cookie_secret[COOKIE_SECRET_LENGTH];
int cookie_initialized = 0;

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
  } else if(tmp_e < tmp_s) {
    tmp_s = tmp_e + ((TIME_MAX * 1000000) - tmp_s);
  } else {
    tmp_s = 0;
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
  printf( TIME_FMT",% 2ld.%06lu,%4d:%s\n",
          (tv_s.tv_sec % TIME_MAX), tv_s.tv_usec, tv.tv_sec, tv.tv_usec, line, msg);
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
    
#if (KEY_WAIT == 1)
    if(senddata_size[DATA_NUM] == size ){
      fprintf(stderr, "all end : %s, %d snd:%d\n", type, senddata_size[idx - 1], snd_count);
      return 0;
    }
    fprintf(stderr, "eny Enter key >");
    getchar();
    fflush(stdin);
#endif
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
  sprintf(buf, "%4d,%4s, %6d,"TIME_FMT , no, type, size, (tv.tv_sec % TIME_MAX), tv.tv_usec);
  sprintf(log, "%.31s", buf);
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
  printf(TIME_FMT",% 2ld.%06lu,%.30s\n", (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, msg);

  msg[ size + 1] = '\n';
  //printf(":%d %s %d:", no, type, size);
  if((RE_TRY - 1) == no) {
    if(senddata_size[DATA_NUM - 1] == size ){
      fprintf(stderr, "all end : %s%d rcv:%d\n", type, size, rcv_count);
      return 0;
    } else {
      fprintf(stderr, "end : %s%d rcv:%d\n", type, size, rcv_count);
    }
  }

  if(strlen(msg) > 0) ++rcv_count;

#if ( TIME_WAIT > 0)
  usleep( TIME_WAIT );
#endif
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

  sscanf( log, "%d,%s%d,%ld.%06lu", &i, dummy, &i, &(tv_s.tv_sec), &(tv_s.tv_usec));
  tv_s = diff_time( &tv_s, &tv );
  printf( TIME_FMT",% 2ld.%06lu,%s\n", (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, log);

#if ( (TIME_WAIT + NEXT_SEND_WAIT) > 0)
  usleep( TIME_WAIT + NEXT_SEND_WAIT );
#endif
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
      fprintf(stderr, "ssl_get_accept %ld (%d)\n", ERR_get_error(), ssl_eno );
      perror("ssl_get_accept");
      exit(1);
    }
}

int ssl_check_read( SSL *ssl, char *buf){
  int len, ret;
  LOGS();
  while (1)
    {
      LOGC();
      /* SSLデータ受信 */
      len  = SSL_read(ssl, buf, BUFSIZE);
      if ( 0 < len ) break;
      ret = SSL_get_error(ssl, len);
      switch (ret)
        {
        case SSL_ERROR_NONE:
          break;
        case SSL_ERROR_WANT_READ:
        case SSL_ERROR_WANT_WRITE:
        case SSL_ERROR_SYSCALL:
          fprintf(stderr, "SSL_read() ret=%d error:%d errno:%d ", len, ret, errno);
          perror("read");
          continue;
          //case SSL_ERROR_ZERO_RETURN:
        case SSL_ERROR_SSL:
          printf("SSL read error: %s (%d)\n", ERR_error_string(ERR_get_error(), buf), ret);
          break;
        default:
          fprintf(stderr, "SSL_read() ret=%d error:%d errno:%d ", len, ret, errno);
          perror("read");
          return 1;
          // エラー処理
        }
      break;
    }
  LOGE(SSL_read);
  return 0;
}
int ssl_check_write( SSL *ssl, char *msg, int size){
  int ret, len;
  LOGS();
  while (1)
    {
      LOGC();
      /* SSLデータ送信 */
      len  = SSL_write(ssl, msg, size);
      if ( 0 < len ) break;
      ret = SSL_get_error(ssl, ret);
      switch (ret)
        {
        case SSL_ERROR_NONE:
          break;
        case SSL_ERROR_WANT_READ:
        case SSL_ERROR_WANT_WRITE:
        case SSL_ERROR_SYSCALL:
          fprintf(stderr, "SSL_write() ret:%d error:%d errno:%d ", len, ret, errno);
          perror("write");
          continue;
        case SSL_ERROR_SSL:
          printf("SSL write error: %s (%d)\n", ERR_error_string(ERR_get_error(), msg), ret);
          break;
        default:
          fprintf(stderr, "SSL_write() ret:%d error:%d errno:%d ", len, ret, errno);
          perror("write");
          return 1;
          // エラー処理
        }
      break;
    }
  LOGE(SSL_write);
  return 0;
}

void ssl_check_shutdown( SSL *ssl ){
  int ret, len;

  LOGS();
  while (1)
    {
      LOGC();
      /* SSL通信の終了 */
      len  = SSL_shutdown(ssl);
      ret = SSL_get_error(ssl, len);
      switch (ret)
        {
        case SSL_ERROR_NONE:
          break;
        case SSL_ERROR_WANT_READ:
        case SSL_ERROR_WANT_WRITE:
        case SSL_ERROR_SYSCALL:
          //fprintf(stderr, "SSL_shutdown() re try (len:%d ret:%d errno:%d\n", len, ret, errno);
          continue;
        default:
          fprintf(stderr, "SSL_shutdown() ret:%d error:%d errno:%d ", len, ret, errno);
          perror("write");
          break;
        }
      break;
    }
  LOGE(SSL_shutdown);
}

int generate_cookie(SSL *ssl, unsigned char *cookie, unsigned int *cookie_len)
{
	unsigned char *buffer, result[EVP_MAX_MD_SIZE];
	unsigned int length = 0, resultlength;
	union {
		struct sockaddr_storage ss;
		struct sockaddr_in6 s6;
		struct sockaddr_in s4;
	} peer;

	/* Initialize a random secret */
	if (!cookie_initialized)
		{
      if (!RAND_bytes(cookie_secret, COOKIE_SECRET_LENGTH))
        {
          printf("error setting random cookie secret\n");
          return 0;
        }
      cookie_initialized = 1;
		}

	/* Read peer information */
	(void) BIO_dgram_get_peer(SSL_get_rbio(ssl), &peer);

	/* Create buffer with peer's address and port */
	length = 0;
  length += sizeof(struct in_addr);
	length += sizeof(in_port_t);
	buffer = (unsigned char*) OPENSSL_malloc(length);

	if (buffer == NULL)
		{
      printf("out of memory\n");
      return 0;
		}

  memcpy(buffer,
         &peer.s4.sin_port,
         sizeof(in_port_t));
  memcpy(buffer + sizeof(peer.s4.sin_port),
         &peer.s4.sin_addr,
         sizeof(struct in_addr));

	/* Calculate HMAC of buffer using the secret */
	HMAC(EVP_sha1(), (const void*) cookie_secret, COOKIE_SECRET_LENGTH,
       (const unsigned char*) buffer, length, result, &resultlength);
	OPENSSL_free(buffer);

	memcpy(cookie, result, resultlength);
	*cookie_len = resultlength;

	return 1;
}

int verify_cookie(SSL *ssl, const unsigned char *cookie, unsigned int cookie_len)
{
	unsigned char *buffer, result[EVP_MAX_MD_SIZE];
	unsigned int length = 0, resultlength;
	union {
		struct sockaddr_storage ss;
		struct sockaddr_in6 s6;
		struct sockaddr_in s4;
	} peer;

	/* If secret isn't initialized yet, the cookie can't be valid */
	if (!cookie_initialized)
		return 0;

	/* Read peer information */
	(void) BIO_dgram_get_peer(SSL_get_rbio(ssl), &peer);

	/* Create buffer with peer's address and port */
	length = 0;
  length += sizeof(struct in_addr);
	length += sizeof(in_port_t);
	buffer = (unsigned char*) OPENSSL_malloc(length);

	if (buffer == NULL)
		{
      printf("out of memory\n");
      return 0;
		}
  memcpy(buffer,
         &peer.s4.sin_port,
         sizeof(in_port_t));
  memcpy(buffer + sizeof(in_port_t),
         &peer.s4.sin_addr,
         sizeof(struct in_addr));

	/* Calculate HMAC of buffer using the secret */
	HMAC(EVP_sha1(), (const void*) cookie_secret, COOKIE_SECRET_LENGTH,
       (const unsigned char*) buffer, length, result, &resultlength);
	OPENSSL_free(buffer);

	if (cookie_len == resultlength && memcmp(result, cookie, resultlength) == 0)
		return 1;

	return 0;
}


////////////////////////////////////////////////////////////////////////////////
/* --------------------------------- DEFS ---------------------------------- */
struct thdata {
  int                 sock;
  SSL                 *ssl;
  void                (*func)( int sock, SSL *ssl );

  pthread_t           th;
  sem_t               sync;
  sem_t               start;
  int  end;
};
/* ------------------------------------------------------------------------- */

/* ------------------------------- FUNCTIONS ------------------------------- */
/*****************************************************************************
 FUNCTION    : void *thread_function (void *thdata)
 DESCRIPTION : Thread function.
 * Argument
                 void *
                 * Return
                 void *
 ATTENTION   :
*****************************************************************************/
#define THREAD_MAX   10
void *thread_function(void *thdata)
{
  struct thdata       *priv = (struct thdata *)thdata;

  while(1){
    /* sync */
    sem_post(&priv->sync);
    sem_wait(&priv->start);

    /* 実行 */
    if ( !(priv->end) ){
      priv->func( priv->sock, priv->ssl );
      priv->sock = 0;
      priv->ssl = NULL;
    } else {
      /* sync */
      sem_post(&priv->sync);
      break;
    }
  }

  /* done */
  return (void *) NULL;
}

struct thdata *sock_thread_create( void (*func)(int sock, SSL *ssl) )
{
  struct thdata       *thdata;
  int i;

  /* initialize thread data */
  thdata = calloc(sizeof(struct thdata), THREAD_MAX);
  if (thdata == NULL) {
    perror("calloc()");
    exit(EXIT_FAILURE);
  }

  for (i = 0; i < THREAD_MAX; i++) {
    thdata[i].sock = 0;
    thdata[i].ssl = NULL;
    thdata[i].end = 0;
    thdata[i].func = func;
    sem_init(&thdata[i].sync, 0, 0);
    sem_init(&thdata[i].start, 0, 0);
    int rtn = pthread_create(&thdata[i].th,
                             NULL,
                             thread_function,
                             (void *) (&thdata[i]));
    if (rtn != 0) {
      fprintf(stderr, "pthread_create() #%0d failed for %d.", i, rtn);
      exit(EXIT_FAILURE);
    }
  }

  /* synchronization */
  for (i = 0; i < THREAD_MAX; i++) {
    sem_wait(&thdata[i].sync);
  }

  return thdata;
}

 void  sock_thread_post( struct thdata *thdata, int sock, SSL *ssl )
{
  int i = 0;
  for(i = 0; i < THREAD_MAX; i++){
    struct thdata *priv = thdata + i;
    if( priv->sock == 0 && priv->ssl == NULL ){
      priv->sock = sock;
      priv->ssl = ssl;
      sem_post(&priv->start);
      break;
    }
  }
  if( i < THREAD_MAX){
  } else {
    fprintf(stderr, "ERROR: thread empty.\n");
    exit(EXIT_FAILURE);
  }
}

void  sock_thread_join( struct thdata *thdata )
{
  int i = 0;
  for(i = 0; i < THREAD_MAX; i++){
    struct thdata *priv = thdata + i;

    /* スレッド終了を動作させる  */
    sem_wait(&priv->sync);
    priv->end = 1;
    sem_post(&priv->start);
    sem_wait(&priv->sync);

    /* スレッド終了待ち  */
    pthread_join(priv->th, NULL);
    sem_destroy(&priv->sync);
    sem_destroy(&priv->start);
  }

  free(thdata);
}
