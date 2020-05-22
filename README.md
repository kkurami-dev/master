-*- mode: markdown  coding: utf-8-unix; -*- Time-stamp: "2020-05-23 05:33:17 kuramitu"
--------------------------------------------------------------------------------
OpenSSL と通常のソケット通信を行うサンプル

- C言語で書かれている TCP / UDP / TLS / DTLS の通信サンプル
- TLS の相互認証を行うようにする
- １つのメッセージでクライアントは通信を切断
- 複数パターンのメッセージサイズを送信
- １つのメッセージサイズで 100 回の送信を実施 (common_data.h : RE_TRY)
- IP アドレスを変更することで、ローカル内だけではなく、
  2PC間での通信に対応 (common_data.h : HOST_IP)
- (tcp/udp/ssl/dtls)_client  ->  (tcp/udp/ssl/dtls)_server
  で通信を行う
- server のプログラムを実行後に、client のプログラムを実行
- 実行後は server / client ともに終了（速度計測用の為）データの最後(999 を 100 回送信で停止)
- エラー処理が不足しているが、速度計測用と割り切っている
- 時間と指定バイトまで「A」で埋めたデータを送信、応答は「ack」固定
- マイクロ秒単位までの時間を出力

## 参考URL
- SSL : https://blog.sarabande.jp/post/82087204080
- SSL : https://blog.sarabande.jp/post/82068392478
- SSL : https://qiita.com/yoshida-jk/items/fc5f8357adcbcbf6044a
- TCP : https://qiita.com/tajima_taso/items/13b5662aca1f68fc6e8e
- UDP : http://hensa40.cutegirl.jp/archives/780
- DTLS: https://github.com/nplab/DTLS-Examples/blob/master/src/dtls_udp_echo.c
- DTLS: https://gist.github.com/Jxck/b211a12423622fe304d2370b1f1d30d5
- Linux ERRNO：https://software.fujitsu.com/jp/manual/manualfiles/M090058/J2X14260/05Z200/pclmsab/pclms130.html

- SSL : [OpenSSL APIを利用したSSL/TLS通信](https://qiita.com/yoshida-jk/items/fc5f8357adcbcbf6044a)
- TCP : [ソケットプログラミング](https://www.katto.comm.waseda.ac.jp/~katto/Class/11/GazoTokuron/code/socket.html)
- 


## 未対応
- TLS の Session 再開機能 : https://techblog.yahoo.co.jp/infrastructure/ssl-session-resumption/
- HTTP/2 クライアント実装サンプル (TLS版) : https://www.nslabs.jp/http2-client-implementation-sample-tls-version.rhtml
- 

# SSL
SSL/TLS で通信を行い、その時間を計測する
```
ssl_client.c
ssl_server.c
```
- SOCK_STREAM
- SSLv23_client_method
- SSLv23_server_method
- SSL_write() -> SSL_read()
- SSL_read() <- SSL_write()
- SSL_connect() 後 SSL_write() を開始、SSL_read() でいるまで待つ

# DTLS
DTLS で通信を行い、その時間を計測する
```
dtls_client.c
dtls_server.c
```
- SOCK_DGRAM
- DTLSv1_2_server_method
- DTLSv1_2_client_method
- DTLSv1_listen : で待ち受け続ける
- SSL_accept() ： 読込を待ち続ける
- BIO
- SSL_write() -> SSL_read()
- タイムアウトは設定していない

# TCP
暗号化なしのTCPソケット通信
```
tcp_server.c
tcp_client.c
```
- SOCK_STREAM
- send() -> recv() 
- recv() <- send()

# UDP
暗号化なしのUDPソケット通信
```
udp_server.c
udp_client.c
```
- SOCK_DGRAM
- sendto() -> recvfrom()

# その他他のファイル
- common_data.c : 共通処理ファイル
  （送信データ作成、時間計測、エラー詳細表示）
- common_data.h : 共通定義
  ポート、送信先IP、バッファサイズ
- ca.pem : CA局の証明書
- dtls_udp_echo.c : DTLS の参考サンプル
- Makefile : dtls_udp_echo.c のコンパイル用
- ssl_server_accept.c : SSLの参考サンプル

# サブツール
- batch_build.sh : 全てのソースをコンパイル
- batch_scp.sh : 複数のリモートPCにSSHで bin を転送
- batch_test.sh : -s(サーバ) -c(クライアント) で全プロトコルをテスト
- cert.sh : 相互認証に使うための、証明書作成バッチ
- clean.sh : 一時ファイルをいったん作成

# 確認
Linux で  tshark  を使いパケットキャプチャを行い。  
キャプチャ内容は Windows の Wireshark で確認する。

[Wiresharkを使った通信監視（後編）――コマンドラインベースでのパケットキャプチャ](https://knowledge.sakura.ad.jp/6311/)
1. wireshark か tshark をインストール
    $ sudo yum install wireshark
    $ sudo apt install tshark
    
1. 利用できるネットワークインターフェイスを確認
    $ tshark -D
    $ echo > ./log/capture2.ssl
    $ tshark -i eth0 -w ./log/capture2.ssl  -f "port 1443" -a duration:10
    $ echo > ./log/capture2.dtls
    $ tshark -i eth0 -w ./log/capture2.dtls -f "port 1443" -a duration:10
    

