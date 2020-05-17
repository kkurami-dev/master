#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#include "common_data.h"

/* https://qiita.com/yoshida-jk/items/fc5f8357adcbcbf6044a  */
int main(void)
{
  SSL_CTX *ctx;
  SSL *ssl;
  /* SSL/TLS汎用でSSL_CTXオブジェクトを生成 */
  if (!(ctx = SSL_CTX_new(SSLv23_server_method())))
    {
      fprintf(stderr, "%d :%d errno:%d\n", __LINE__, retval, errno );
      perror("connect");
      exit(EXIT_FAILURE);
    }
  /* SSLv2はセキュリティ的にNGなので除く*/
  SSL_CTX_set_options(ctx, SSL_OP_NO_SSLv2);

  // 証明書の登録
  if (1 != SSL_CTX_use_certificate_file(ctx, certificate, SSL_FILETYPE_PEM))
    {
      fprintf(stderr, "%d :%d errno:%d\n", __LINE__, retval, errno );
      perror("connect");
      exit(EXIT_FAILURE);
    }

  // 秘密鍵の登録
  if (1 != SSL_CTX_use_PrivateKey_file(ctx, privatekey, SSL_FILETYPE_PEM))
    {
      fprintf(stderr, "%d :%d errno:%d\n", __LINE__, retval, errno );
      perror("connect");
      exit(EXIT_FAILURE);
    }

  // CA証明書の登録とクライアント証明書の要求
  if (1 != SSL_CTX_load_verify_locations(ctx, ca_certificate, NULL))
    {
      // エラー処理
    }
  // 証明書検証機能の有効化
  SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER | SSL_VERIFY_FAIL_IF_NO_PEER_CERT, NULL);
  // 証明書チェーンの深さ
  SSL_CTX_set_verify_depth(ctx,9);
  
  /* SSLオブジェクトを生成 */
  if (!(ssl = SSL_new(ctx)))
    {
      // エラー処理
    }
  /* SSLオブジェクトとファイルディスクリプタを接続 */
  if (!SSL_set_fd(ssl, fd))
    {
      // エラー処理
    }
  while (1)
    {
      /* SSL通信の開始 */
      sslret  = SSL_accept(ssl);
      ssl_eno = SSL_get_error(ssl, sslret);
      switch (ssl_eno)
        {
        case SSL_ERROR_NONE:
          break;
        case SSL_ERROR_WANT_READ:
        case SSL_ERROR_WANT_WRITE:
        case SSL_ERROR_SYSCALL:
          continue;
        default:
          // エラー処理
        }
      break;
    }
}
