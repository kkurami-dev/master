#!/bin/bash

GroupName="/aws/lambda/mySendToken"
s_time=$(date +%s --date "2020-12-02 00:00 JST")
e_time=$(date +%s --date "2020-12-20 00:00 JST")
echo "${s_time} -> ${e_time}"

aws logs filter-log-events --log-group-name ${GroupName} --start-time ${s_time} --end-time ${e_time}

# http://localhost:3000/aws_lambda
