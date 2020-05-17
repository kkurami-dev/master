#!/bin/bash
# -*- coding: utf-8-unix -*-

set -xue

export LD_LIBRARY_PATH=.:..:./bin

declare -a array=(
    "ssl"
    "dtls"
    "tcp"
    "udp"
)

TYPE="server"
while getopts csh OPT
do
    case $OPT in
        s)  TYPE="server"
            ;;
        c)  TYPE="client"
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

pushd ~/OpenSSL/bin
[ ! -d ../log ]; mkdir ../log

for ((i = 0; i < ${#array[@]}; i++)) {
        echo "array[$i] = ${array[i]}"
        COMMAND=${array[i]}_${TYPE}
        ./${COMMAND} > ../log/${COMMAND}.csv
        sleep 1
    }
popd
