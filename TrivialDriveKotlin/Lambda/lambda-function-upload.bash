#!/bin/bash

PATH=/c/Program\ Files/7-Zip:${PATH}
set -au

CMDNAME=`basename $0`
if [ $# -gt 1 ]; then
    echo "Usage: ${CMDNAME} [profile]" 1>&2
    exit 1
fi

zipUpload(){
    # 引数に命名
    FPATH=$1

    # 引数よりアーカイブのファイル名作成
    ZIP=${PWD}/${FPATH}.zip
    UZIP=${PWD}/${FPATH}.zip
    UZIP=${UZIP#/i}

    echo "# ${FPATH} の圧縮、アップロード、削除の一連処理"
    7z a -tzip -r ${ZIP} ./${FPATH}/* > /dev/null
    aws lambda update-function-code \
        --function-name ${FPATH} \
        --zip-file fileb://${UZIP} \
        --region "ap-northeast-1" \
        --publish  > /dev/null
    rm ${ZIP}

    # echo "# Lambda関数 ${FPATH} の直接実行"
    # aws lambda invoke --function-name ${FPATH} out \
    #     --payload '{"text":"hello"}' \
    #     --log-type Tail \
    #     --query 'LogResult' --output text | base64 -d
    
    # echo "# Lambda関数 ${FPATH} の直接実行"
    # aws lambda invoke --function-name ${FPATH} out \
    #     --region "ap-northeast-1" \
    #     --payload '{"text":"hello"}' \
    #     --log-type Tail
}

zipUpload myHelloWorld
zipUpload mySendToken


#arn:aws:lambda:ap-northeast-1:176264229023:function:myHelloWorld
#arn:aws:lambda:ap-northeast-1:176264229023:function:mySendToken
