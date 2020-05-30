#!/bin/bash

FILE=$1
FILE=./log/log_${FILE}.pcapng

echo > ${FILE}
chmod 777 ${FILE}
tshark -i lo -w ${FILE} -f "port 1443"
