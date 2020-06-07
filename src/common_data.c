/* -*- coding: utf-8-unix -*- */
#include <unistd.h>
#include <openssl/rand.h>

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <sys/io.h>            /* for inb,outb */

#include <sys/types.h>
#include <netdb.h>
#include <unistd.h>
#include <openssl/evp.h>

#include <semaphore.h>
#include <pthread.h>

#define TIME_MAX (long)(3600)
//#define TIME_MAX (long) ( 600 )
#define TIME_FMT  "% 5ld.%06lu,"

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
   100	,
   /* 送信データ  */
   //35200	,
   10200	,
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

int get_settings_fd(char *host, int type, int cs, struct sockaddr_in* out_adr){
  static struct addrinfo s_res = {0};
  static struct sockaddr_in addr = {0};
  struct addrinfo hints;
  struct addrinfo *res = NULL;
  struct addrinfo *ai = NULL;
  const int on = 1;
  int sockfd;

  bzero(&hints, sizeof(hints));
  hints.ai_socktype = type;

  if( cs == TEST_RECEIVER ){
    hints.ai_family = AF_INET6;
    hints.ai_flags = AI_PASSIVE;
  } else {
    hints.ai_family = AF_UNSPEC;
  }

  if ( s_res.ai_addr ){
    ai = &s_res;
  } else {
    getaddrinfo(host, TLS_PORT_W, &hints, &res);
    ai = res;
    s_res = *res;
  }

  if ( cs == TEST_RECEIVER ){
    sockfd = socket(ai->ai_family, ai->ai_socktype, ai->ai_protocol);
#if (SETSOCKOPT == 1)
    setsockopt(sockfd, SOL_SOCKET, SO_LINGER, (const void*) &on, (socklen_t) sizeof(on));
    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, (const void*) &on, (socklen_t) sizeof(on));
#endif // (SETSOCKOPT == 1)
    bind(sockfd, ai->ai_addr, ai->ai_addrlen);
    listen(sockfd, QUEUELIMIT);

  } else {
    int i = 0;
    int ret;
    for(; ai; ai = ai->ai_next) {
      sockfd = socket(ai->ai_family, ai->ai_socktype, ai->ai_protocol);
      //ret = connect(sockfd, ai->ai_addr, ai->ai_addrlen);
      if( !addr.sin_port ){
        addr.sin_family = ai->ai_family;
        addr.sin_port = htons(TLS_PORT);
        inet_aton(HOST_IP, &addr.sin_addr);
      }
      ret = connect(sockfd, (struct sockaddr*)&addr, sizeof(addr));
      if(!ret)
        break;
      close(sockfd);
      fprintf(stderr, "connect re try %d. ret:%d errno:%d\n", i++, ret, errno);
    }
    if (out_adr) *out_adr = addr;
  }

  if(res) freeaddrinfo(res);
  return sockfd;
}
/*
struct addrinfo {
    int              ai_flags;
    int              ai_family;
    int              ai_socktype;
    int              ai_protocol;
    socklen_t        ai_addrlen;
    struct sockaddr *ai_addr;
    char            *ai_canonname;
    struct addrinfo *ai_next;
};

/usr/include/netinet/in.h:
   struct in_addr {
      u_int32_t s_addr;
   };

   struct sockaddr_in {
      u_char  sin_len;    （このメンバは古いOSでは存在しない）
      u_char  sin_family;    （アドレスファミリ．今回はAF_INETで固定）
      u_short sin_port;    （ポート番号）
      struct  in_addr sin_addr;    （IPアドレス）
      char    sin_zero[8];    （無視してもよい．「詰め物」のようなもの）
   };
*/

/* 
 * 経過時刻の計算
 * timeval構造体の差分計算（最大１日の差分まで出す)
 */
static struct timeval diff_time( struct timeval *tv_s, struct timeval *tv_e){
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
static void time_log(int line, char *msg){
  struct timeval tv_e;
  gettimeofday(&tv_e, NULL);
  tv_e = diff_time( &tv_s, &tv_e );
  printf( TIME_FMT"% 2ld.%06lu,%4d:%s\n",
          (tv_s.tv_sec % TIME_MAX), tv_s.tv_usec, tv_e.tv_sec, tv_e.tv_usec, line, msg);
}

int OPT_START_NO  = -1;
int OPT_CLIENT_NUM  = 1;
void set_argument( int argc, char* argv[] ){
  char *word;
  int  tmp_num;
  
  if ( argc < 2 ){
    return;
  }

  if ( argc > 1 ){
    word = argv[1];
    tmp_num = -1;
    sscanf( word, "%d", &tmp_num );
    if (DATA_NUM < tmp_num){
      fprintf( stderr, "error index %d( max : %d )", tmp_num, DATA_NUM);
      exit(EXIT_FAILURE);
    }
    if (tmp_num > 0){
      OPT_START_NO = tmp_num;
    }
  }
  if ( argc > 2 ){
    word = argv[2];
    tmp_num = -1;
    sscanf( word, "%d", &tmp_num );
    if (1 > tmp_num){
      fprintf( stderr, "error client num %d( min : 1 )", tmp_num);
      exit(EXIT_FAILURE);
    }
    OPT_CLIENT_NUM = tmp_num;
  }
}

/* 
 * 送信メッセージ作成と送信開始時間の記録
 */
struct timeval tv_all;
int get_data( int count, char *type, char *msg, char *log ){
  struct timeval tv;

  /* 送信ダー他の決定  */
  int no = ( count % RE_TRY );
  int idx = (int)( count / RE_TRY );
  int size = senddata_size[idx];
  char buf[ 256 ];

  if (OPT_START_NO > 0){
    idx = OPT_START_NO - 1;
    size = senddata_size[idx];
  }

  /* 1つの送信データ送信完了 */
  //if ( 0 == count ) printf("No.,type,msg size, start time, end time\n");
  if ( 0 == count )   gettimeofday(&tv_all, NULL);
  if (0 == no  && 0 != count){
    gettimeofday(&tv, NULL);
    tv = diff_time( &tv_all, &tv );
    if(senddata_size[DATA_NUM] == size ){
      fprintf(stderr, "all end, %s, %d snd:%d, % 2ld.%06lu\n",
              type, senddata_size[idx], snd_count, tv.tv_sec, tv.tv_usec);
      return 0;
    } else {
      fprintf(stderr, "end, %s, %d snd:%d, % 2ld.%06lu\n",
              type, senddata_size[idx], snd_count, tv.tv_sec, tv.tv_usec);
    }

    /* 開始位置の指定が有る場合はいつも1回で終了 */
    if(OPT_START_NO > 0){
      return 0;
    }
    
#if (KEY_WAIT == 1)
    fprintf(stderr, "eny Enter key >");
    getchar();
    fflush(stdin);
#endif
    gettimeofday(&tv_all, NULL);
  }
  /* 全ての計測用データ送信完了 */
  if (DATA_NUM <= idx){
    return 0;
  }

  //memset( msg, 0x00, BUFSIZE);
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
  printf(TIME_FMT"% 2ld.%06lu,%.30s\n",
         (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, msg);
  if(strlen(msg) > 20) ++rcv_count;

  msg[ size + 1] = '\n';
  //printf(":%d %s %d:", no, type, size);
  if((RE_TRY - 1) <= no) {
    if(senddata_size[DATA_NUM - 1] == size ){
      fprintf(stderr, "all end : %s%d rcv:%d\n", type, size, rcv_count);
      return 0;
    } else {
      fprintf(stderr, "end : %s%d rcv:%d\n", type, size, rcv_count);
    }
    /* 開始位置の指定が有る場合はいつも1回で終了 */
    if(OPT_START_NO > 0){
      return 0;
    }
  }

#if ( TIME_WAIT > 0)
  usleep( TIME_WAIT );
#endif
  return no + 1;
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
  printf( TIME_FMT"% 2ld.%06lu,%s\n",
          (tv.tv_sec % TIME_MAX), tv.tv_usec, tv_s.tv_sec, tv_s.tv_usec, log);

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

int ssl_check_error(SSL *ssl, int sslret){
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
    default:
      // エラー処理
      fprintf(stderr, "ssl_check_return %ld (%d) errno:%d\n", ERR_get_error(), ssl_eno, errno );
      perror("SSL_accept");
      exit(EXIT_FAILURE);
    }
}

int ssl_check_read( SSL *ssl, char *buf){
  int len, ret;
  LOGS();
  while (1) {
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
  while (1) {
    LOGC();
    /* SSLデータ送信 */
    len  = SSL_write(ssl, msg, size);
    if ( 0 < len ) break;
    ret = SSL_get_error(ssl, len);
    switch (ret)
      {
      case SSL_ERROR_NONE:
        break;
      case SSL_ERROR_WANT_READ:
      case SSL_ERROR_WANT_WRITE:
      case SSL_ERROR_SYSCALL:
        fprintf(stderr, "SSL_write() ret:%d error:%d errno:%d ", len, ret, errno);
        perror("write():");
        continue;
      case SSL_ERROR_SSL:
        printf("SSL write error: %s (%d)\n", ERR_error_string(ERR_get_error(), msg), ret);
        break;
      default:
        fprintf(stderr, "SSL_write() ret:%d error:%d errno:%d ", len, ret, errno);
        perror("write():");
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
  while (1){
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
        perror("SSL_shutdown():");
        break;
      }
    break;
  }
  LOGE(SSL_shutdown);
}

int generate_cookie(SSL *ssl, unsigned char *cookie, unsigned int *cookie_len) {
	unsigned char *buffer, result[EVP_MAX_MD_SIZE];
	unsigned int length = 0, resultlength;
	union {
		struct sockaddr_storage ss;
		struct sockaddr_in6 s6;
		struct sockaddr_in s4;
	} peer;

	/* Initialize a random secret */
	if (!cookie_initialized) {
    if (!RAND_bytes(cookie_secret, COOKIE_SECRET_LENGTH)){
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

	if (buffer == NULL) {
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

int verify_cookie(SSL *ssl, const unsigned char *cookie, unsigned int cookie_len) {
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

	if (buffer == NULL){
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
  int                (*func)( int sock, SSL *ssl );
  int                 opt_start_no;
  int                 no;

  pthread_t           th;
  sem_t               sync;
  sem_t               start;
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
#define THREAD_MAX   ( QUEUELIMIT * 2)
void *thread_function(void *thdata)
{
  struct thdata       *priv = (struct thdata *)thdata;
  int ret = 0;
  
  OPT_START_NO = priv->opt_start_no;

  /* sync */
  sem_post(&priv->sync);
  while(1){
    sem_wait(&priv->start);
    DEBUG0( fprintf(stderr, "thread_function exe: %d\n", priv->no ) );

    /* 実行 */
    if (!priv->sock || !priv->ssl ) {
      DEBUG0( fprintf(stderr, "thread_function end rcv. \n") );
      break;
    }
    ret = priv->func( priv->sock, priv->ssl );
    priv->sock = 0;
    priv->ssl = NULL;

    /* sync */
    if ( ret ) {
      DEBUG0( fprintf(stderr, "thread_function ret:%d \n", ret) );
      break;
    }
  }
  /* sync */
  sem_post(&priv->sync);

  /* done */
  fprintf(stderr, "thread_function end. 0x%lx\n", pthread_self());
  return (void *) NULL;
}

struct thdata *sock_thread_create( int (*func)(int sock, SSL *ssl) )
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
    thdata[i].no = i;
    thdata[i].opt_start_no = OPT_START_NO;
    thdata[i].sock = 0;
    thdata[i].ssl = NULL;
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

int msg_count = 1;
int  sock_thread_post( struct thdata *thdata, int sock, SSL *ssl )
{
  int i = 0;
  for(i = 0; i < THREAD_MAX; i++){
    struct thdata *priv = thdata + i;
    if( !priv->sock && !priv->ssl ){
      priv->sock = sock;
      priv->ssl = ssl;
      DEBUG0( fprintf(stderr, "sem_post(%d): rcv: %d\n", i, sock) );
      sem_post(&priv->start);
      break;
    }
  }

  //fprintf(stderr, "count : %d > %d \n", msg_count, OPT_CLIENT_NUM * RE_TRY );
  if(++msg_count > (OPT_CLIENT_NUM * RE_TRY)){
    for(i = 0; i < THREAD_MAX; i++){
      struct thdata *priv = thdata + i;
      if( !priv->sock && !priv->ssl ){
        //priv->sock = 0;
        //priv->ssl = NULL;
        DEBUG0( fprintf(stderr, "sem_post(%d): end : %d\n", i, sock) );
        sem_post(&priv->start);
      }
    }
    return 1;
  } else if( i > THREAD_MAX ){
    fprintf(stderr, "ERROR: thread empty.\n");
    //exit(EXIT_FAILURE);
  }

  return 0;
}

void  sock_thread_join( struct thdata *thdata )
{
  DEBUG0( fprintf(stderr, "pthread_join()\n") );
  int i = 0;
  for(i = 0; i < THREAD_MAX; i++){
    struct thdata *priv = thdata + i;

    /* スレッド終了待ち  */
    pthread_join(priv->th, NULL);
    sem_destroy(&priv->sync);
    sem_destroy(&priv->start);
  }

  fprintf(stderr, "all end.\n");
  free(thdata);
}
