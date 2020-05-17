-*- mode: markdown  coding: utf-8-unix; -*- Time-stamp: "2020-05-17 13:49:55 kuramitu"
--------------------------------------------------------------------------------

# SSL
# DTLS
# TCP
# UDP

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
    $ tshark -i eth0 -w ./log/capture2.ssl  -f "port 8765" -a duration:10
    $ echo > ./log/capture2.dtls
    $ tshark -i eth0 -w ./log/capture2.dtls -f "port 32323" -a duration:10
    

