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

  int server;
  struct sockaddr_in server_addr;
  struct sockaddr_storage client_addr;
  char buf[BUFSIZE];

  SSL_load_error_strings();
  SSL_library_init();
  OpenSSL_add_all_algorithms();
  ctx = SSL_CTX_new(DTLS_server_method());

  /* サーバ認証設定 */
  SSL_CTX_set_options(ctx, SSL_OP_NO_SSLv2);/* SSLv2はセキュリティ的にNGなので除く*/
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, S_CERT)); // 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, S_KEY, SSL_FILETYPE_PEM)); // 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録とクライアント証明書の要求
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

  BIO *bio;
  int accept = 0;
  int len;
  int ret;
  while(1) {
    LOG(bio = BIO_new_dgram(server, BIO_NOCLOSE));
    LOG(ssl = SSL_new(ctx));
    LOG(SSL_set_fd(ssl, server));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_set_options(ssl, SSL_OP_COOKIE_EXCHANGE));

    LOGS();
    do {
      ret = DTLSv1_listen(ssl, (BIO_ADDR *)&client_addr);///
      LOGC()
    }while (ret <= 0);
    LOGE(DTLSv1_listen);

    LOGS();
    while(accept == 0) {
      accept = SSL_accept(ssl);
      LOGC();
    }
    LOGE(SSL_accept);

    do {
      if(ssl_check_read(ssl , buf)){
        goto cleanup;
      }
#if (ONE_SEND == 1)
      if (rcvprint( buf ) == 0){
        break;
      }
#else // (ONE_SEND == 1)
      break;
#endif // (ONE_SEND == 1)
    } while(1);

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
    
  cleanup:
    LOG(SSL_free(ssl));

#if (ONE_SEND == 0)
    ret = rcvprint( buf );
    if( ret == 0 ) break;
#else// (ONE_SEND == 0)
    break;
#endif// (ONE_SEND == 0)
  }

  close(server);
  SSL_CTX_free(ctx);

  return EXIT_SUCCESS;
}

