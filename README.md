-*- mode: markdown  coding: utf-8-unix; -*- Time-stamp: "2020-05-17 23:16:47 kuramitu"
--------------------------------------------------------------------------------
- C言語で書かれている TCP / UDP / TLS / DTLS の通信サンプル
- TLS の相互認証を行うようにする
- １つのメッセージでクライアントは通信を切断
- 複数パターンのメッセージサイズを送信
- １つのメッセージサイズで 1000 回の送信を実施
- マイクロ秒単位まで時間を出力
- IP アドレスを変更することで、ローカル内だけではなく、
  2PC間での通信に対応
- (tcp/udp/ssl/dtls)_client  ->  (tcp/udp/ssl/dtls)_server
  で通信を行う
- server のプログラムを実行後に、client のプログラムを実行
- 実行後は server / client ともに終了（速度計測用の為）
- 時間と指定バイトまで「A」で埋めたデータを送信、応答は「ack」固定

## 参考URL
- SSL : https://blog.sarabande.jp/post/82087204080
- SSL : https://blog.sarabande.jp/post/82068392478
- TCP : https://qiita.com/tajima_taso/items/13b5662aca1f68fc6e8e
- UDP : http://hensa40.cutegirl.jp/archives/780
- DTLS: 
- DTLS: https://gist.github.com/Jxck/b211a12423622fe304d2370b1f1d30d5
- 

# SSL
SSL/TLS で通信を行い、その時間を計測する
- SOCK_STREAM
- SSLv23_client_method
- SSLv23_server_method
- SSL_write() -> SSL_read()
- SSL_read() <- SSL_write()
- SSL_connect() 後 SSL_write() を開始、SSL_read() でいるまで待つ

# DTLS
DTLS で通信を行い、その時間を計測する
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
- SOCK_STREAM
- send() -> recv() 
- recv() <- send()

# UDP
暗号化なしのUDPソケット通信
- SOCK_DGRAM
- sendto() -> recvfrom()

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
    

