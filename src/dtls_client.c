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
  struct addrinfo server;

  SSL *ssl;
  SSL_CTX *ctx;
  SSL_SESSION *ssl_session = NULL;
  const long flags=(SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1);
  BIO *bio;

  char msg[BUFSIZE];
  char log[128];
  int i = 0;
  int size;

  /* 前準備 */
  SSL_load_error_strings();
  SSL_library_init();
  ctx = SSL_CTX_new(DTLS_client_method());

#if (TEST_SSL_SESSION == 1)
  /* セッションの再開機能 */
  SSL_CTX_set_session_cache_mode(ctx, SSL_SESS_CACHE_BOTH );
  //SSL_CTX_sess_set_new_cb(ctx, sess_cache_new);
  //SSL_CTX_sess_set_get_cb(ctx, sess_cache_get);
  //SSL_CTX_sess_set_remove_cb(ctx, sess_cache_remove);
#endif // (TEST_SSL_SESSION == 1)
  
  /* 認証設定 */
  LOG(SSL_CTX_set_options(ctx, flags));/* SSLv2はセキュリティ的にNGなので除く*/
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, C_CERT));// 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
  //SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
  //LOG(SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback));// 証明書検証機能の有効化
  //LOG(SSL_CTX_set_verify_depth (ctx, 2));// 証明書チェーンの深さ
  //LOG(SSL_CTX_set_read_ahead(ctx, 1));

  while(1){
    size = get_data(i++, "dtls", msg, log );
    if ( 0 == size ){
      break;
    }

    /* 接続 */
    mysocket = get_settings_fd( HOST, SOCK_DGRAM, TEST_SENDER, &server);
    LOG(bio = BIO_new_dgram(mysocket, BIO_NOCLOSE));
    LOG(BIO_ctrl(bio, BIO_CTRL_DGRAM_SET_CONNECTED, 0, &server));
    LOG(ssl = SSL_new(ctx));
    if(ssl_session) {
      LOG(SSL_set_session(ssl, ssl_session));
    }
    LOG(SSL_set_bio(ssl, bio, bio));
    LOG(SSL_connect(ssl));///

#if (TEST_SSL_SESSION == 1)
    if(!ssl_session) {
      LOG(ssl_session = SSL_get1_session(ssl));
    }
#endif

    /* 通信 */
    do {
      if(ssl_check_write(ssl, msg, size)){
        goto cleanup;
      }

#if (ONE_SEND == 1)
      endprint(log);
      size = get_data(i++, "dtls", msg, log );
      if (size == 0){
        break;
      }
#else // (ONE_SEND == 1)
      break;
#endif //(ONE_SEND == 1)
    } while (1);

    /* 切断 */
    ssl_check_shutdown( ssl );

  cleanup:
    LOG(SSL_free(ssl));
    LOG(close(mysocket));

#if (ONE_SEND == 0)
    endprint(log);
#else// (ONE_SEND == 0)
    break;
#endif// (ONE_SEND == 0)
  }

  if(ssl_session) {
    LOG(SSL_SESSION_free(ssl_session));
  }
  SSL_CTX_free(ctx);
  ERR_free_strings();
  return EXIT_SUCCESS;
}


