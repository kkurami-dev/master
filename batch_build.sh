#!/bin/bash
# -*- coding: utf-8-unix -*-
set -xue

#DEBUG_OPTE="-Wall -g -O0 -fstack-protector"
DEBUG_OPTE="-Wall"

# https://blog.sarabande.jp/post/82087204080
# https://blog.sarabande.jp/post/82068392478
gcc ${DEBUG_OPTE} -o bin/ssl_server -I ~/tools/include -L ~/tools/lib  ./src/ssl_server.c -lssl -lcrypto 2>&1
gcc ${DEBUG_OPTE} -o bin/ssl_client -I ~/tools/include -L ~/tools/lib  ./src/ssl_client.c -lssl -lcrypto 2>&1

# https://qiita.com/tajima_taso/items/13b5662aca1f68fc6e8e
gcc ${DEBUG_OPTE} -o bin/tcp_server -I ~/tools/include ./src/tcp_server.c
gcc ${DEBUG_OPTE} -o bin/tcp_client -I ~/tools/include ./src/tcp_client.c

# [ C言語 ] UDP / IP でパケットの送受信を行う
# http://hensa40.cutegirl.jp/archives/780
gcc ${DEBUG_OPTE} -o bin/udp_server -I ~/tools/include ./src/udp_server.c
gcc ${DEBUG_OPTE} -o bin/udp_client -I ~/tools/include ./src/udp_client.c

# DTLS でメッセージ送信
# https://github.com/nplab/DTLS-Examples
#cd src
#make dtls_udp_echo
#cd ..
# を参考に自作
gcc ${DEBUG_OPTE} -o bin/dtls_server -I ~/tools/include -L ~/tools/lib  ./src/dtls_server.c -lssl -lcrypto 2>&1
gcc ${DEBUG_OPTE} -o bin/dtls_client -I ~/tools/include -L ~/tools/lib  ./src/dtls_client.c -lssl -lcrypto 2>&1


# https://ozuma.hatenablog.jp/entry/20130511/1368284304
if [ ! -f bin/server.key ]; then
    cd bin
    openssl genrsa 2048 > server.key
    openssl req -new -key server.key > server.csr
    openssl x509 -days 3650 -req -signkey server.key < server.csr > server.crt
    cd ..
fi

exit

# c++ OpensslSample.cpp -o OpensslSample -lcrypto



