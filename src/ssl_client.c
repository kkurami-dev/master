#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include "common_data.h"

int main(void)
{
  int sockfd;

  SSL *ssl;
  SSL_CTX *ctx;
  SSL_SESSION *ssl_session = NULL;
  const long flags=SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_TLSv1_2;

  char log[128];
  char msg[BUFSIZE];

  SSL_load_error_strings();
  SSL_library_init();
  ctx = SSL_CTX_new(TLS_client_method());
  SSL_CTX_set_session_cache_mode(ctx, SSL_SESS_CACHE_BOTH );

  /* クライアント認証設定 (テストなのでエラー確認のを除く) */
  LOG(SSL_CTX_set_options(ctx, flags));
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, C_CERT));// 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
  //SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
  //LOG(SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback));// 証明書検証機能の有効化
  //LOG(SSL_CTX_set_verify_depth (ctx, 2));// 証明書チェーンの深さ
  //LOG(SSL_CTX_set_read_ahead(ctx, 1));

  int i = 0;
  int size;
  while(1){
    size = get_data(i++, " ssl", msg, log );
    if ( 0 == size ){
      fprintf(stderr, "end\n\n");
      break;
    }

    sockfd = get_settings_fd( HOST, SOCK_STREAM, TEST_SENDER, NULL);
 
    LOG(ssl = SSL_new(ctx));
    if(ssl_session) LOG(SSL_set_session(ssl, ssl_session));
    LOG(SSL_set_fd(ssl, sockfd));

    /* 接続 */
    LOGS();
    if( -1 == SSL_connect(ssl) ){
      /* 接続失敗したら処理を最初からやり直す  */
      fprintf(stderr, "\nSSL_connect failed with :%d errno:%d\n\n", SSL_get_error(ssl, -1), errno );
      goto cleanup;
    }
    LOGE( SSL_connect() );

#if (TEST_SSL_SESSION == 1)
    if(!ssl_session) LOG(ssl_session = SSL_get1_session(ssl));
#endif
    do {
      /*  受送信処理 */
      ssl_check_write(ssl, msg, size);

#if (SERVER_REPLY == 1)
      char buf[BUFSIZE];
      ssl_check_read(ssl, buf);
#endif

#if (ONE_SEND == 1)
      /* 接続をしたまま、再度メッセージを送る */
      endprint(log);
      if ( get_data(i++, " ssl", msg, log ) == 0){
        break;
      }
#else
      break;
#endif
    } while(1);

    /* 切断 */
    ssl_check_shutdown( ssl );

  cleanup:
    LOG(SSL_free(ssl));
    LOG(close(sockfd));

#if (ONE_SEND == 0)
    endprint(log);
#else
    break;
#endif
  }

  if(ssl_session) LOG(SSL_SESSION_free(ssl_session));
  LOG(SSL_CTX_free(ctx));
  ERR_free_strings();
  return EXIT_SUCCESS;
}


