#!/bin/bash
# -*- coding: utf-8-unix -*-

set -ue

export LD_LIBRARY_PATH=.:..:../tools/lib:./tools/lib:

declare -a array=(
    "ssl"
    "dtls"
    "tcp"
    "udp"
)
declare -a array_size=(
    100
    50
    150
    200
    400
    600
    800
    1000
    2000
    4000
    6000
    8000
    10000
)

#DEBUG=echo
DEBUG=
PROCES=
function exec_loop(){
    _log_file=""
    for i in {1..13} ; do
        _size_key=${PROCES}_${array_size[$i - 1]}
        _log_base=../log/log_${_size_key}
        echo "### ${PROCES}_(server/client) $i > ${_log_base}_* "

        _log_file=${_log_base}_cap.pcapng
        #${DEBUG} sudo tshark -i lo -w ${_log_file} &
        sleep 0.5

        _log_file=${_log_base}_server.csv
        ${DEBUG} ${PROCES}_server $i > ${_log_file} &
        sleep 0.3

        _log_file=${_log_base}_client.csv
        ${DEBUG} ${PROCES}_client $i > ${_log_file}
        sleep 1

        ls -lhF ${_log_base}_*
        ${DEBUG} pkill tshark
        ${DEBUG} pkill ${PROCES}_server
        count=`ps -ef | grep ${PROCES}_server | grep -v grep | wc -l`
        if [ $count = 0 ]; then
            echo "server stiopd."
        else
            echo "server a."
        fi
        echo
        
        exit
    done
}


pushd ~/OpenSSL/bin
if [ ! -d ../log ]; then
    mkdir ../log
else
    rm -rf ../log
    mkdir ../log
fi
for var in ${array[@]} ; do
    PROCES=${var}
    pkill ${PROCES}_server
    exec_loop
done
popd
