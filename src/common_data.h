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

#define MSGSIZE 102400
#define BUFSIZE (MSGSIZE + 1)
#define HOST    "localhost"
#define HOST_IP "127.0.0.1"
#define TLS_PORT 1443

#define S_CERT "server-cert.pem"
#define S_KEY  "server-key.pem"
#define C_CERT "client-cert.pem"
#define C_KEY  "client-key.pem"
#define CA_PEM "ca.pem"

void ssl_ret_check( int ret, int line, const char *msg );

#define SSL_RET(x)		ssl_ret_check( (x),    __LINE__, #x );
#define SSL_RETN(x)		ssl_ret_check( !(x), __LINE__, #x );
#define SSL_RET1(x)		ssl_ret_check( (1 != x), __LINE__, #x );

#define LOG(x)        {gettimeofday(&tv_s, NULL);};x;time_log(__LINE__, #x);
#define LOGS()        {gettimeofday(&tv_s, NULL);log_count = 0;}
#define LOGC()        log_count++;
#define LOGE(x)        sprintf(log_msg, "%s(%d)", #x, log_count );time_log(__LINE__, log_msg);
//#define LOG(x)        x

#define RE_TRY  1000

struct timeval tv_s;
int log_count;
char log_msg[MSGSIZE];

#include "common_data.c"
