#!/bin/bash
# -*- coding: utf-8-unix -*-

set -ue

export LD_LIBRARY_PATH=.:..:../tools/lib:./tools/lib:

declare -a array=(
    "dtls"
#    "ssl"
#    "tcp"
#    "udp"
)
declare -a array_size=(
    100
#    50
#    150
#    200
#    400
#    600
#    800
#    1000
#    2000
#    4000
#    6000
#    8000
#    10000
)

#DEBUG=echo
DEBUG=
PROCES=
function prop_kill(){
    for var in ${array[@]} ; do
        pkill ${PROCES}_server &
    done
}
function exec_loop(){
    _log_file=""
#    for i in {1..13} ; do
    for i in 1 ; do
        _size_key=${PROCES}_${array_size[$i - 1]}
        _log_base=../log/log_${_size_key}
        echo "### ${PROCES}_(server/client) $i > ${_log_base}_* "

        _log_file=${_log_base}_cap.pcapng
        #${DEBUG} sudo tshark -i lo -w ${_log_file} &
        sleep 0.5

        _log_file=${_log_base}_server.csv
        ${DEBUG} ./${PROCES}_server $i > ${_log_file} &
        sleep 0.5

        _log_file=${_log_base}_client.csv
        ${DEBUG} ./${PROCES}_client $i > ${_log_file}
        sleep 1

        ls -lhF ${_log_base}_*
        count=`ps -ef | grep ${PROCES}_server | grep -v grep | wc -l`
        if [ $count = 0 ]; then
            echo "server stiopd."
        else
            ${DEBUG} pkill ${PROCES}_server
            echo "server a."
        fi
        ${DEBUG} pkill tshark
        echo

        #exit
    done
}

while getopts krh OPT
do
    case $OPT in
        k)  prop_kill
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

pushd ~/OpenSSL/bin
if [ ! -d ../log ]; then
    mkdir ../log
else
    rm -rf ../log
    mkdir ../log
fi
for var in ${array[@]} ; do
    PROCES=${var}
    pkill ${PROCES}_server &
    exec_loop
done
popd
