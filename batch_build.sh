#!/bin/bash
# -*- coding: utf-8-unix -*-
set -ue

DEBUG_OPTE="-Wall -g -O0 -fstack-protector"
#DEBUG_OPTE="-Wall"
INC="-I ${HOME}/tools/include -L ${HOME}/tools/lib"
LIB="-lssl -lcrypto"

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
for ((i = 0; i < ${#array[@]}; i++)) {
        echo "### gcc -o bin/${array[i]} ${array[i]}.c ###"
        rm bin/${array[i]}
        gcc ${DEBUG_OPTE} -o bin/${array[i]} ${INC} ./src/${array[i]}.c ${LIB} 2>&1
}
if [ ! -f bin/ca.pem ]; then
    cp src/ca.pem bin/ca.pem
    cert.sh
fi
exit
