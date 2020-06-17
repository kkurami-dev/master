#!/bin/bash

#set -x

PROCES=ssl
CLIENT=1
DATA_SIZE=1

_log_base=../log/log_400

cd ~/OpenSSL/bin
export LD_LIBRARY_PATH=/mnt/i/yoshimaru/linux_home/openssl-1.1.1g.BACK
export PATH=/mnt/i/yoshimaru/linux_home/openssl-1.1.1g.BACK:$PATH
#ldd ./${PROCES}_server
#exit
#read -p "Hit enter: "

pkill ${PROCES}_server
for i in 1..5 ; do
    pkill ${PROCES}_client
done
sleep 1
read -p "Hit enter: "

_log_file=${_log_base}_server.csv
#./${PROCES}_server ${DATA_SIZE} 3 > ${_log_file} &
./${PROCES}_server ${DATA_SIZE} 5 &
sleep 1.5

#for i in 2 3 4 5 ; do
for i in 5 4 3 2 ; do
    _log_file=${_log_base}_client_${i}.csv
    echo ${_log_file}
    ./${PROCES}_client ${DATA_SIZE} ${i} &
    #./${PROCES}_client ${DATA_SIZE} ${i} > ${_log_file} 2>&1 &
    sleep 0.5
done

_log_file=${_log_base}_client_1.csv
#./${PROCES}_client ${DATA_SIZE} 1 > ${_log_file} 2>&1
./${PROCES}_client ${DATA_SIZE} 1
sleep 1.5
