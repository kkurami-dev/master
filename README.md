-*- mode: markdown  coding: utf-8-unix; -*- Time-stamp: "2020-05-31 10:16:11 kuramitu"
--------------------------------------------------------------------------------
OpenSSL と通常のソケット通信を行うサンプル

## コーディングメモ
- 標準では DTLS での１回の送信では 16384 byte までしか送信できていない、
  おそらく MTU の設定ではないか。
- 受信側で setsockopt() で SO_REUSEADDR を設定しないと、連続で切断、接
  続を繰り返す確認では、送信側でエラーになる。
- socket(), connect(), bind(), listen() の指定をおろそかにすると、セッ
  ションの再開機能が有効にならない。  
  さらに、SSL_CTX_set_session_cache_mode() の SSL_SESS_CACHE_BOTH 指定
  も必要そう。（接続に +3msec 程度必要になる）
- DTLS で SSL_OP_NO_TLSv1_2 を付けると通信できなくなる。
- SSL_shutdown() は SSL_ERROR_NONE まで繰り返す必要がある、
  SSL_write()/SSL_read() 後、システム側で高確率で通信が継続している。
  切断後、次の接続が失敗し、通信が出来なくなってしまう。
- 証明書の読み込みは時間が掛かる（証明書が変わらなければ、再読み込みし
  ない方が良い）

## 仕様
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

## サンプル
- SSL : https://blog.sarabande.jp/post/82087204080
- SSL : https://blog.sarabande.jp/post/82068392478
- SSL : https://qiita.com/yoshida-jk/items/fc5f8357adcbcbf6044a
- TCP : https://qiita.com/tajima_taso/items/13b5662aca1f68fc6e8e
- UDP : http://hensa40.cutegirl.jp/archives/780
- DTLS: https://github.com/nplab/DTLS-Examples/blob/master/src/dtls_udp_echo.c
- DTLS: https://gist.github.com/Jxck/b211a12423622fe304d2370b1f1d30d5
- Linux ERRNO：https://software.fujitsu.com/jp/manual/manualfiles/M090058/J2X14260/05Z200/pclmsab/pclms130.html

- SSL : [OpenSSL APIを利用したSSL/TLS通信](https://qiita.com/yoshida-jk/items/fc5f8357adcbcbf6044a)
- TLS の Session 再開機能 : https://techblog.yahoo.co.jp/infrastructure/ssl-session-resumption/
- HTTP/2 クライアント実装サンプル (TLS版) : https://www.nslabs.jp/http2-client-implementation-sample-tls-version.rhtml
- 

## 参考資料
- SSL : [OpenSSL API によるセキュア・プログラミング 第 1 回 API の概要 基本的なセキュア接続と非セキュア接続を作成する](https://www.ibm.com/developerworks/jp/linux/library/l-openssl/index.html)
- [SOCKET](https://linuxjm.osdn.jp/html/LDP_man-pages/man2/socket.2.html)
- TCP : [ソケットプログラミング](https://www.katto.comm.waseda.ac.jp/~katto/Class/11/GazoTokuron/code/socket.html)
- DTLS: [OpenSSL DTLS API](https://gist.github.com/Jxck/b211a12423622fe304d2370b1f1d30d5)
  APIの解説の日本語訳
- TCP/UDP : [C言語-ソケットプログラミング](http://capm-network.com/?tag=C言語-ソケットプログラミング)
- GDB : [gcc+gdbによるプログラムのデバッグ 第3回 gdbの便利な機能、デバッグの例](https://rat.cis.k.hosei.ac.jp/article/devel/debugongccgdb3.html)
- LINUX：[10.3　メッセージに含まれるエラー情報](http://itdoc.hitachi.co.jp/manuals/3020/30203N6450/BJEX0275.HTM)

## 通信内容
- [【図解】https(SSL/TLS)の仕組みとシーケンス,パケット構造 〜暗号化の範囲, Encrypted Alert, ヘッダやレイヤについて～](https://milestone-of-se.nesuke.com/nw-basic/tls/https-structure/)
  
  ![図解](https://github.com/kkurami-dev/master/blob/Openssl-Examples/image/tls-sequence-01.webp "通信概要")

- SSL のソースに当てはめて  
  ![SSLの場合](https://github.com/kkurami-dev/master/blob/Openssl-Examples/image/SSL通信シーケンス.png "SSLの場合")

- DTLS のソースに当てはめて  


- 通信内容を ワイヤーシャークでキャプチャした結果  
![DTLSの通信内容](https://github.com/kkurami-dev/master/blob/Openssl-Examples/image/DTLSの通信内容.png "通信内容")

# SSL
SSL/TLS で通信を行い、その時間を計測する
```
ssl_client.c
ssl_server.c
```
- SOCK_STREAM
- SSL_client_method
- SSL_server_method
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
- DTLS_server_method
- DTLS_client_method
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
## Linux で  tshark  を使いパケットキャプチャを行い。  
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
    
## 相互認証の場合
「多くの場合」３つのメッセージから構成されると書いたのは、
クライアントからも証明書を送って相互認証
(Mutual Authentication)を行う場合、Server Hello 手順には
Server Key Exchange メッセージ(msg_type=13)と
Certificate Request メッセージ(msg_type=13) が追加で含まれるからです。
この場合、クライアントは
Client Key Exchange 手順の前に
Certificate メッセージ(msg_type=11) と
Certificate Verify メッセージ(msg_type=15) を返送します。
