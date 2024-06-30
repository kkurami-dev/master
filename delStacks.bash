#!/bin/bash

set -aue

#PROFILE=$1
#MODE=$2

#list_org=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE --profile ${PROFILE} --no-verify-ssl --output json )
list_org='
[
    {
        "StackName": "SX01MyTestStack01"
    },
    {
        "StackName": "SX01MyTestStack02"
    },
    {
        "StackName": "SX01MyTestStack03"
    }
]'
echo "$list_org" > a.txt

list=$( echo $list_org | jq -r '.[].StackName' )
echo $list

if [ $MODE != "delete" ]; then
    exit 0;
fi

for func in ${list[@]}; do
    aws cloudformation delete-stack \
        --stack-name ${func} \
        --profile ${PROFILE} --no-verify-ssl
done
exit 0;


for func in ${list[@]}; do
    aws lambda delete-function \
        --function-name ${func} \
        --profile ${PROFILE} --no-verify-ssl
done
