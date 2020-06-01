#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>
#include <openssl/rand.h>
#include <openssl/dtls1.h>

#include "common_data.h"

int main(void)
{
  int mysocket;
  struct sockaddr_in server;

  SSL *ssl;
  SSL_CTX *ctx;
  char msg[BUFSIZE];
  char log[128];

  /* 前準備 */
  LOG(SSL_load_error_strings());
  LOG(SSL_library_init());
  LOG(ctx = SSL_CTX_new(DTLS_client_method()));

  /* 認証設定 */
  /* クライアント認証設定 (テストなのでエラー確認のを除く) */
  SSL_CTX_set_options(ctx, SSL_OP_NO_SSLv2);/* SSLv2はセキュリティ的にNGなので除く*/
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, C_CERT));// 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
  SSL_CTX_set_verify_depth (ctx, 2);// 証明書チェーンの深さ
  SSL_CTX_set_read_ahead(ctx, 1);

  int i = 0;
  BIO *bio;
  int size;
  while(1){
    size = get_data(i++, "dtls", msg, log );
    if ( 0 == size ){
      break;
    }

    /* 接続 */
    LOG(mysocket = get_settings_fd( HOST, SOCK_DGRAM, TEST_SENDER, &server));
    LOG(bio = BIO_new_dgram(mysocket, BIO_NOCLOSE));
    LOG(BIO_ctrl(bio, BIO_CTRL_DGRAM_SET_CONNECTED, 0, &server));
    LOG(ssl = SSL_new(ctx));
    //LOG(SSL_set_fd(ssl, mysocket));
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_connect(ssl));///

    /* 通信 */
    do {
      if(ssl_check_write(ssl, msg, size)){
        goto cleanup;
      }

#if (ONE_SEND == 1)
      if (i & RE_TRY){
        endprint(log);
        size = get_data(i++, "dtls", msg, log );
      } else {
        break;
      }
#else // (ONE_SEND == 1)
      break;
#endif //(ONE_SEND == 1)
    } while (1);

    /* 切断 */
    LOG(SSL_shutdown(ssl));
    
  cleanup:
    LOG(close(mysocket));
    LOG(SSL_free(ssl));
    endprint(log);
  }

  LOG(SSL_CTX_free(ctx));
  return EXIT_SUCCESS;
}

