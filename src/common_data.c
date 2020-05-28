/* -*- coding: utf-8-unix -*- */
#include <unistd.h>
#include <openssl/rand.h>

#define TIME_MAX (long)(3600)
//#define TIME_MAX (long) ( 600 )
#define TIME_FMT  "% 5ld.%06lu"

#define COOKIE_SECRET_LENGTH 16

#if (TEST == 1)
#define DATA_NUM  2
const int senddata_size[ DATA_NUM + 1] =
  {
   /* 送信データ  */
   100,
   16384,
   0
  };
#else
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
   0
  };
#endif

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

  sscanf( log, "%d,%s%d,%ld.%06lu", &i, dummy, &i, &(tv_s.tv_sec), &(tv_s.tv_usec));
  tv_s = diff_time( &tv_s, &tv );
  printf( TIME_FMT",% 2ld.%06lu,%s\n", (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, log);

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

