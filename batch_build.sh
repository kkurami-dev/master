#!/bin/bash
# -*- coding: utf-8-unix -*-
set -ue
#set -xv

DEBUG_OPTE="-Wall -g -O0 -fstack-protector -fsanitize=address"
#DEBUG_OPTE="-Wall"
INC="-I ${HOME}/tools/include -L ${HOME}/tools/lib"
LIB="-lssl -lcrypto"
CLEN="rm -rf *.pem server* client* ca-* src/certs bin/*"
REBULD=0

while getopts rch OPT
do
    case $OPT in
        d)  ${CLEN}
            exit;
            ;;
        r)  REBULD=1
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

declare -a array=(
    "ssl_server"
    "ssl_client"
    "dtls_server"
    "dtls_client"
    "tcp_server"
    "tcp_client"
    "udp_server"
    "udp_client"
)
if [ ! -d bin ]; then
    mkdir bin
fi
if [ ! -d log ]; then
    mkdir log
fi

for v in "${array[@]}"
do
    echo "### gcc -o bin/$v $v.c ###"
    BIN=./bin/$v
    SRC=./src/$v.c

    # 強制再ビルド
    if [ ${REBULD} == 1 ]; then
        rm -f ${BIN}
    fi

    if [ ! -f ${BIN} ]; then
        # bin がないのでコンパイル
        gcc ${DEBUG_OPTE} -o ${BIN} ${INC} ${SRC} ${LIB} 2>&1
    elif [ ${SRC} -nt ${BIN} ]; then
        # bin が古いのでコンパイル
        rm ${BIN}
        gcc ${DEBUG_OPTE} -o ${BIN} ${INC} ${SRC} ${LIB} 2>&1
    fi
done
if [ ! -f bin/ca.pem ]; then
    cp src/ca.pem bin/ca.pem
    cert.sh
fi
exit
