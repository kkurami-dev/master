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
#define TLS_PORT_W "1443"

#define S_CERT "server-cert.pem"
#define S_KEY  "server-key.pem"
#define C_CERT "client-cert.pem"
#define C_KEY  "client-key.pem"
#define CA_PEM "ca.pem"

/* 各種設定 */
#define LOG_PRINT              1 /* 詳細にログを出力する     */
#define TEST                   0 /* テストデータを少なく絞る  */
#define ONE_SEND               0 /* データを全て1接続で送る    */
#define KEY_WAIT               0 /* 1つのデータサイズのデータを送信完了するとキー入力待ちになる    */
#define SERVER_REPLY           0 /* TPC/TLS の場合にサーバから応答を返すか  */
#define RE_TRY             10000 /* 一つのサイズのメッセージ送信回数 */
#define TIME_WAIT              0 /* メッセージ送信全体の待ち時間  */
#define NEXT_SEND_WAIT         0 /* 上記に加えて、送信プロセスの待ち時間 */
#define QUEUELIMIT             8 /* サーバの待ちキューの数（サーバのthreadプール数）  */
#define SETSOCKOPT             1 /* サーバのソケットを再利用、クローズ待ちしない   */
                                 /* tcp で Connection refused で止まる   */
#define TEST_SSL_SESSION       1 /* 暗号化のセッションを保存し、再開する */

#define SSL_RET(x)		gettimeofday(&tv_s, NULL);ssl_ret_check( (x), __LINE__, #x );time_log(__LINE__, #x);
#define SSL_RETN(x)		gettimeofday(&tv_s, NULL);ssl_ret_check( !(x), __LINE__, #x );time_log(__LINE__, #x);
#define SSL_RET1(x)		gettimeofday(&tv_s, NULL);ssl_ret_check( (1 != x), __LINE__, #x );time_log(__LINE__, #x);

#if (LOG_PRINT == 1)
#define LOG(x)        {gettimeofday(&tv_s, NULL);};x;time_log(__LINE__, #x);
#define LOGS()        {gettimeofday(&tv_s, NULL);log_count = 0;}
#define LOGC()        log_count++;
#define LOGE(x)       sprintf(log_msg, "%s(%d)", #x, log_count );time_log(__LINE__, log_msg);
#else
#define LOG(x)        x
#define LOGS()
#define LOGC()
#define LOGE(x)
#endif

#define TEST_SENDER               0
#define TEST_RECEIVER             1

struct timeval tv_s;
int log_count;
char log_msg[BUFSIZE];

#include "common_data.c"
