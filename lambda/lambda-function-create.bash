#!/bin/bash

set -au

array_up=(
    mySendToken
    #test0002
);

PATH=/e/work/7-Zip:${PATH}
CMDNAME=`basename $0`
if [ $# -gt 1 ]; then
    echo "Usage: ${CMDNAME} [profile]" 1>&2
    exit 1
fi

zipUpload(){
    echo "#----------------------------------------"
    # 引数に命名
    FPATH=$1

    # 引数よりアーカイブのファイル名作成
    ZIP=${FPATH}.zip

    param=""
    func_json=$(cat ${FPATH}/${FPATH}.json)
    role=$(echo ${func_json} | jq -r '.Role' )
    handler=$(echo ${func_json} | jq -r '.Handler' )
    timeout=$(echo ${func_json} | jq -r '.Timeout' )
    memory=$(echo ${func_json} | jq -r '.MemorySize' )

    # 必須ではないパラメータを設定する
    layers=$(echo ${func_json} | jq -r '.Layers[].Arn' | sed -z 's/\n/ /g' )
    if [ "$layers" != null ]; then
        param="${param} --layers ${layers}"
    fi
    envi=$(echo ${func_json} | jq -r '.Environment ' | sed -z 's/[\n ]//g' )
    if [ "$envi" != null ]; then
        param="${param} --environment ${envi}"
    fi

    aws lambda delete-function --function-name ${FPATH}

    echo "# ${FPATH} の圧縮、アップロード、削除の一連処理"
    7z a -tzip -r ${ZIP} ./${FPATH}/*
    aws lambda create-function \
        --function-name ${FPATH} \
        --zip-file fileb://${ZIP} \
        --region "ap-northeast-1" \
        --runtime "nodejs14.x" \
        --role $role \
        --handler $handler \
        --timeout $timeout \
        --memory-size $memory \
        ${param} \
        --publish  > ./${FPATH}.log
    rm -rf ${ZIP}
}

# 対象の実行
for e in ${array_up[@]}; do
    zipUpload ${e}
done
