/* -*- coding: utf-8-unix -*- */
#include <sys/time.h>
#include <stdio.h> //printf(), fprintf(), perror()
#include <sys/socket.h> //socket(), bind(), accept(), listen()
#include <arpa/inet.h> // struct sockaddr_in, struct sockaddr, inet_ntoa(), inet_aton()
#include <stdlib.h> //atoi(), exit(), EXIT_FAILURE, EXIT_SUCCESS
#include <string.h> //memset(), strcmp()
#include <unistd.h> //close()

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>

#define MSGSIZE 102656
#define BUFSIZE (MSGSIZE + 1)
#define HOST    "localhost"
#define HOST_IP "127.0.0.1"
#define TLS_PORT 1443

#define S_CERT "server-cert.pem"
#define S_KEY  "server-key.pem"
#define C_CERT "client-cert.pem"
#define C_KEY  "client-key.pem"
#define CA_PEM "ca.pem"

//void ssl_ret_check( int ret, int line, const char *msg );

#define SSL_RET(x)		ssl_ret_check( (x),    __LINE__, #x );
#define SSL_RETN(x)		ssl_ret_check( !(x), __LINE__, #x );
#define SSL_RET1(x)		ssl_ret_check( (1 != x), __LINE__, #x );

#define LOG_PRINT          1 /*  詳細にログを出力する     */
#define TEST               0 /*  テストデータを少なく絞る  */
#define ONE_SEND           0 /* データを全て1接続で送る    */
#define KEY_WAIT           1 /* 1つのデータサイズのデータを送信完了するとキー入力待ちになる    */
#define SERVER_REPLY       0 /* TPC/TLS の場合にサーバから応答を返すか  */

#if (LOG_PRINT == 1)
#define LOG(x)        {gettimeofday(&tv_s, NULL);};x;time_log(__LINE__, #x);
#define LOGS()        {gettimeofday(&tv_s, NULL);log_count = 0;}
#define LOGC()        log_count++;
#define LOGE(x)        sprintf(log_msg, "%s(%d)", #x, log_count );time_log(__LINE__, log_msg);
#else
#define LOG(x)        x
#define LOGR(x)        x
#define LOGS()
#define LOGC()
#define LOGE(x)
#endif
//#define LOGR(x)        LOG(x)
#define LOGR(x)        x

#if (TEST == 1)
#define RE_TRY  10   /* 一つのサイズのメッセージ送信回数 */
#elif (TEST == 2)
#define RE_TRY  1000
#elif (ONE_SEND == 1)
#define RE_TRY  10000
#else
#define RE_TRY  10000
#endif

#define TIME_WAIT 0
//#define NEXT_SEND_WAIT  30000
//#define NEXT_SEND_WAIT  10000
#define NEXT_SEND_WAIT  0

#define QUEUELIMIT 32

struct timeval tv_s;
int log_count;
char log_msg[BUFSIZE];

#include "common_data.c"
