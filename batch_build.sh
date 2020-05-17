#!/bin/bash
# -*- coding: utf-8-unix -*-
set -xue

#DEBUG_OPTE="-Wall -g -O0 -fstack-protector"
DEBUG_OPTE="-Wall"
INC="-I ${HOME}/tools/include -L ${HOME}/tools/lib"
LIB="-lssl -lcrypto"

# https://blog.sarabande.jp/post/82087204080
# https://blog.sarabande.jp/post/82068392478
gcc ${DEBUG_OPTE} -o bin/ssl_server ${INC} ./src/ssl_server.c ${LIB} 2>&1
gcc ${DEBUG_OPTE} -o bin/ssl_client ${INC} ./src/ssl_client.c ${LIB} 2>&1

# https://qiita.com/tajima_taso/items/13b5662aca1f68fc6e8e
gcc ${DEBUG_OPTE} -o bin/tcp_server ${INC} ./src/tcp_server.c ${LIB}
gcc ${DEBUG_OPTE} -o bin/tcp_client ${INC} ./src/tcp_client.c ${LIB}

# [ C言語 ] UDP / IP でパケットの送受信を行う
# http://hensa40.cutegirl.jp/archives/780
gcc ${DEBUG_OPTE} -o bin/udp_server ${INC} ./src/udp_server.c ${LIB}
gcc ${DEBUG_OPTE} -o bin/udp_client ${INC} ./src/udp_client.c ${LIB}

# DTLS でメッセージ送信
# https://github.com/nplab/DTLS-Examples
#cd src
#make dtls_udp_echo
#cd ..
# https://gist.github.com/Jxck/b211a12423622fe304d2370b1f1d30d5
# を参考に自作
gcc ${DEBUG_OPTE} -o bin/dtls_server ${INC}  ./src/dtls_server.c ${LIB} 2>&1
gcc ${DEBUG_OPTE} -o bin/dtls_client ${INC}  ./src/dtls_client.c ${LIB} 2>&1


if [ ! -d bin ]; then
    mkdir bin
fi
# https://ozuma.hatenablog.jp/entry/20130511/1368284304
if [ ! -f bin/ca.pem ]; then
    cp src/ca.pem bin/ca.pem
    cert.sh
fi

exit

# c++ OpensslSample.cpp -o OpensslSample -lcrypto



