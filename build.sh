#!/bin/bash

set -vxue

# https://blog.sarabande.jp/post/82087204080
# https://blog.sarabande.jp/post/82068392478
gcc -Wall -o bin/ssl_server -I ~/tools/include -L ~/tools/lib  ./src/ssl_server.c -lssl -lcrypto 2>&1
gcc -Wall -o bin/ssl_client -I ~/tools/include -L ~/tools/lib  ./src/ssl_client.c -lssl -lcrypto 2>&1

# https://qiita.com/tajima_taso/items/13b5662aca1f68fc6e8e
gcc -Wall -o bin/tcp_server ./src/tcp_server.c
gcc -Wall -o bin/tcp_client ./src/tcp_client.c
# tcp_server 1443
# tcp_client 127.0.0.1 1443

# [ C言語 ] UDP / IP でパケットの送受信を行う
# http://hensa40.cutegirl.jp/archives/780


# https://ozuma.hatenablog.jp/entry/20130511/1368284304
if [ ! -f bin/server.key ]; then
    cd bin
    openssl genrsa 2048 > server.key
    openssl req -new -key server.key > server.csr
    openssl x509 -days 3650 -req -signkey server.key < server.csr > server.crt
fi

exit

# c++ OpensslSample.cpp -o OpensslSample -lcrypto



