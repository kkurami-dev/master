#!/bin/bash
USEDMEMORY=$(free -m | awk 'NR==2{printf "%.2f\t", $3*100/$2 }')
TCP_CONN=$(netstat -an | wc -l)
TCP_CONN_PORT_80=$(netstat -an | grep 80 | wc -l)
USERS=$(uptime |awk '{ print $6 }')
IO_WAIT=$(iostat | awk 'NR==4 {print $5}')

EC2=i-0c886fac19496682a

aws cloudwatch put-metric-data --metric-name memory-usage --dimensions Instance=$EC2  --namespace "Custom" --value $USEDMEMORY
aws cloudwatch put-metric-data --metric-name Tcp_connections --dimensions Instance=$EC2  --namespace "Custom" --value $TCP_CONN
aws cloudwatch put-metric-data --metric-name TCP_connection_on_port_80 --dimensions Instance=$EC2  --namespace "Custom" --value $TCP_CONN_PORT_80
aws cloudwatch put-metric-data --metric-name No_of_users --dimensions Instance=$EC2  --namespace "Custom" --value $USERS
aws cloudwatch put-metric-data --metric-name IO_WAIT --dimensions Instance=$EC2  --namespace "Custom" --value $IO_WAIT

# aws cloudwatch get-metric-statistics --metric-name Buffers --namespace MyNameSpace --dimensions Name=InstanceId,Value=1-23456789 Name=InstanceType,Value=m1.small --start-time 2020-6-19T04:00:00Z --end-time 2020-6-20T07:00:00Z --statistics Average --period 60
