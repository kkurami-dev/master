#!/bin/bash

FILE=./src/mtls-test02-test1-swagger-apigateway.yaml

set -aue

API_ID=$(perl -ne 'next unless /^host/;print $1 if / "(\w+)\./' ${FILE})
STAGE_NAME=$(perl -ne 'next unless /^basePath/;print $1 if / "\/(\w+)"/' ${FILE})
USER_NAME=$(git config user.name)

base64 $FILE > dst.txt

aws apigateway put-rest-api \
    --rest-api-id $API_ID \
    --mode overwrite \
    --fail-on-warnings \
    --body file://dst.txt > /dev/null

aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name $STAGE_NAME \
    --description "user: $USER_NAME"

rm -rf dst.txt
