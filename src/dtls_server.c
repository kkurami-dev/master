#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>
#include <openssl/rand.h>
#include <openssl/dtls1.h>

#include "common_data.h"

#define BUFFER_SIZE          (1<<16)
#define COOKIE_SECRET_LENGTH 16

unsigned char cookie_secret[COOKIE_SECRET_LENGTH];
int cookie_initialized = 0;

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

int main(void)
{
  SSL_CTX *ctx;
  SSL *ssl;

  int server, ret;
  struct sockaddr_in server_addr;
  struct sockaddr_storage client_addr;
  char buf[BUFSIZE];

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(DTLSv1_2_server_method());

  /* サーバ認証設定 */
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, S_CERT)); // 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM)); // 秘密鍵の登録
  //SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録とクライアント証明書の要求
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback);// 証明書検証機能の有効化
  SSL_CTX_set_verify_depth(ctx,9); // 証明書チェーンの深さ

  bzero(&server_addr, sizeof(server_addr));
  server_addr.sin_family = AF_INET;
  server_addr.sin_addr.s_addr = INADDR_ANY;
  server_addr.sin_port = htons(TLS_PORT);

	SSL_CTX_set_read_ahead(ctx, 1);
	SSL_CTX_set_cookie_generate_cb(ctx, generate_cookie);
	SSL_CTX_set_cookie_verify_cb(ctx, &verify_cookie);

  LOG(server = socket(server_addr.sin_family, SOCK_DGRAM, 0));
  LOG(bind(server, (struct sockaddr*)&server_addr, sizeof(server_addr)));
 
  while(1) {
    bzero(&client_addr, sizeof(client_addr));
    BIO *bio = BIO_new_dgram(server, BIO_NOCLOSE);
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));

    int listen = -1;
    while (listen <= 0){
      LOG(listen = DTLSv1_listen(ssl, (BIO_ADDR *) &client_addr));///
    }

    int client_fd = 0;
    LOG(client_fd = socket(client_addr.ss_family, SOCK_DGRAM, 0));
    LOG(bind(client_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)));
    LOG(connect(client_fd, (struct sockaddr*) &server_addr, sizeof(server_addr)));
#if 0
    int accept = 0;
    while(accept == 0) {
      accept = SSL_accept(ssl);
    }
#else
    LOGS();
    do{
      ret = SSL_accept(ssl);
      ret = ssl_get_accept( ssl, ret );
      LOGC();
      //} while(ret > 0);
    } while(ret);
    LOGE( SSL_accept );
#endif
    
#if 1
    int len = SSL_read(ssl, buf, BUFSIZE);
    ssl_read_error(ssl, len);
#else
    LOGS();
    do {
      /* 読込が成功するまで繰り返す */
      ret = SSL_read(ssl, buf, BUFSIZE);
      ret = ssl_read_error(ssl, ret);
      LOGC();
    } while (ret);
    LOGE( SSL_read );
#endif

    LOG(SSL_shutdown(ssl));
    LOG(SSL_free(ssl));
    LOG(close(client_fd));

    ret = rcvprint( buf );
    if( ret == 0 ) break;
    //fprintf(stderr, "%s\n", buf); // 通信内容全体の出力
    //memset(buf, 0x00, BUFSIZE);
  }

  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

