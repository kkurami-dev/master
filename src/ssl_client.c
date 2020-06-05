#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include "common_data.h"

int main( int argc, char* argv[] )
{
  int sockfd;

  SSL *ssl;
  SSL_CTX *ctx;
  SSL_SESSION *ssl_session = NULL;
  const long flags=SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1 | SSL_OP_NO_TLSv1_2;

  char log[128];
  char msg[BUFSIZE];

  set_argument( argc, argv );

  SSL_load_error_strings();
  SSL_library_init();
  ctx = SSL_CTX_new(TLS_client_method());

  /* セッション関連の設定 */
  const unsigned char session_id[] = "inspircd";
  SSL_CTX_set_session_id_context(ctx, session_id, sizeof(session_id));
  SSL_CTX_set_session_cache_mode(ctx, SSL_SESS_CACHE_BOTH );

  /* クライアント認証設定 (テストなのでエラー確認のを除く) */
  SSL_CTX_set_options(ctx, flags);
  SSL_RET(SSL_CTX_use_certificate_chain_file(ctx, C_CERT));// 証明書の登録
  SSL_RET(SSL_CTX_use_PrivateKey_file(ctx, C_KEY, SSL_FILETYPE_PEM));// 秘密鍵の登録
  SSL_RET(SSL_CTX_load_verify_locations(ctx, CA_PEM, NULL));// CA証明書の登録
  LOG(SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, verify_callback));// 証明書検証機能の有効化
  LOG(SSL_CTX_set_verify_depth (ctx, 2));// 証明書チェーンの深さ
  LOG(SSL_CTX_set_read_ahead(ctx, 1));

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
    if(ssl_session) {
      LOG(SSL_set_session(ssl, ssl_session));
    }
    LOG(SSL_set_fd(ssl, sockfd));

    /* 接続 */
    LOGS();
    if( -1 == SSL_connect(ssl) ){
      /* 接続失敗したら処理を最初からやり直す  */
      fprintf(stderr, "\nSSL_connect failed with :%d errno:%d\n\n", SSL_get_error(ssl, -1), errno );
      goto cleanup;
    }
    LOGE( SSL_connect() );
    /* ossl_statem_server13_write_transition
       write_state_machine

       ssl3_renegotiate_check ,
       ossl_statem_connect, 
        state_machine , ssl_security, ssl_security_default_callback
         tls_setup_handshake,
    */
    DEBUG( if(SSL_session_reused(ssl)) fprintf(stderr, "client SSL_session_reused\n") );

    do {
      /*  受送信処理 */
      ssl_check_write(ssl, msg, size);

#if (SERVER_REPLY == 1)
      char buf[BUFSIZE];
      ssl_check_read(ssl, buf);
#endif

#if (ONE_SEND == 1)
      /* 接続をしたまま、再度メッセージを送る */
      if(count % RE_TRY){
        endprint(log);
        size = get_data(i++, " ssl", msg, log );
      } else {
        break;
      }
#else
      break;
#endif
    } while(1);

    /* 切断 */
    ssl_check_shutdown( ssl );  /* 書き込み指示後、本当に書き込みが完了するまで shutdown() を複数回実施 */

#if (TEST_SSL_SESSION == 1)
    LOGS();
    do {
      if(!ssl_session) ssl_session = SSL_get1_session(ssl); /* セッションの取得 */
      if (SSL_SESSION_is_resumable(ssl_session)) break;     /* 使えるセッションか確認 */
      SSL_SESSION_free(ssl_session);                        /* 使えないセッションを開放 */
      ssl_session = NULL;                                   /* 次のセッション取得のために開放 */
      LOGC();
    } while(1);
    LOGE(SSL_get1_session);
#endif

  cleanup:
    LOG(SSL_free(ssl));
    LOG(close(sockfd));
    endprint(log);
  }

  if(ssl_session) {
    LOG(SSL_SESSION_free(ssl_session));
  }
  LOG(SSL_CTX_free(ctx));
  ERR_free_strings();
  return EXIT_SUCCESS;
}


