#!/bin/bash
# -*- coding: utf-8-unix -*-

set -xue

HOME='/home/kazu/keys'

LOCAL=/mnt/i/yoshimaru/linux_home/OpenSSL
REMOTE=/home/ec2-user/OpenSSL

FROM1=$LOCAL/bin
FROM2=$LOCAL/batch_test.sh
FROM3=$LOCAL/../tools/lib/libssl.so.1.1
FROM4=$LOCAL/../tools/lib/libcrypto.so.1.1
TO=$REMOTE
TYPE=0

# 接続先のPC情報を列挙する配列、"証明書 対象ホストのURL/IP" と記載する
declare -a array=(
)

while getopts pgh OPT
do
    case $OPT in
        p)  
            ;;
        g)  TYPE=1
            FROM1=$REMOTE/log
            TO=$LOCAL
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

pushd $HOME
for ((i = 0; i < ${#array[@]}; i++)) {
        key=${array[i]}
        list=(${key//,/ })
        if [[ ${TYPE} == 0 ]]; then
            scp -p -C -r -i ${list[0]} $FROM1 ${list[1]}:$TO/bin
            scp -p -C -i ${list[0]} $FROM2 ${list[1]}:$TO
            scp -p -C -i ${list[0]} $FROM3 ${list[1]}:$TO/bin
            scp -p -C -i ${list[0]} $FROM4 ${list[1]}:$TO/bin
        else 
            scp -p -C -r -i ${list[0]} ${list[1]}:$FROM1 $TO/log
        fi
    }
popd

