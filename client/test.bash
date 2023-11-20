#!/bin/bash

curl --location --request POST 'https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/my-api/login' \
     --header 'Content-Type: application/json' \
     --data-raw '{
    "func":"login",
    "userId":"test_user01",
    "userPassword":"TestUser01@",
    "call":"curl"
}'
