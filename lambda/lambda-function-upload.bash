#!/bin/bash

set -aue
#set -x
echo "" > UpdateResult.log

array_up=(
    npc
);

# if [ "$1" != "" ]; then
#     array_up=$1
# fi

PATH=/f/work/7-Zip:/f/tool:${PATH}
CMDNAME=`basename $0`
if [ $# -gt 1 ]; then
    echo "Usage: ${CMDNAME} [profile]" 1>&2
    exit 1
fi

Configuration(){
    # 関数名JSON に従い、変更可能な設定をすべて更新する ( setting.json を作成して対応 )
    #  SnapStart は未対応
    #  Layers は内容をレイヤーの配列に変更
    #  Role 権限が必要
    #  RevisionId 指定しない
    func=$1
    #aws lambda get-function-configuration --function-name $func > old.json

    # 更新可能なパラメータ文字列
    keys="FunctionName Handler Description Timeout MemorySize VpcConfig Environment Runtime DeadLetterConfig KMSKeyArn TracingConfig Layers FileSystemConfigs ImageConfig EphemeralStorage"

    # 設定ファイルからデータ読み込みし、更新できるパラメータのみ取得
    org=$(cat ./$func/$func.json | sed -z 's/\r\n//g; s/\n//g')
    ret="{"
    for key in ${keys[@]}; do
        val=$(echo $org | jq -c .$key)
        if [ "$val" == "null" ]; then
            continue
        fi
        if [ $key == "Layers" ]; then
            val=$(echo "$val" | jq [.[].Arn])
        fi

        ret+="\"$key\":$val,"
    done
    # 最後の１文字の処理
    out=$(echo $ret | sed 's/,$/}/')
    # 設定ファイルの形式チェック
    echo $out | jq -S > setting.json
    # 更新実行
    aws lambda update-function-configuration \
        --cli-input-json file://setting.json >> UpdateResult.log
}

zipUpload(){
    echo "#----------------------------------------"
    # 引数に命名
    FPATH=$1

    # 引数よりアーカイブのファイル名作成
    ZIP=${PWD}/${FPATH}.zip
    ZIP2=${FPATH}.zip
    UZIP=${PWD}/${FPATH}.zip
    UZIP=${UZIP#/i}

    echo "# ${FPATH} の圧縮、アップロード、削除の一連処理"
    7z a -tzip -r ${ZIP} ./${FPATH}/*
    echo "# aws lambda update-function-code"
    aws lambda update-function-code \
        --function-name ${FPATH} \
        --zip-file fileb://${ZIP2} \
        --region "ap-northeast-1"  >> UpdateResult.log
    echo "# update-function-code OK"
    rm -rf ${ZIP}
    sleep 1

    Configuration $FPATH
    sleep 4

    # 実行をログ確認
    aws lambda invoke \
        --function-name ${FPATH} \
        --cli-binary-format raw-in-base64-out \
        --payload '{"key": "value"}' out
    cat out | jq . >> UpdateResult.log

    #sed -i'' -e 's/"//g' out
    # LOG_STREAM=$(cat out | jq -r .logStreamName)
    # sleep 3
    # aws logs get-log-events \
        #     --log-group-name "/aws/lambda/${FPATH}" \
        #     --log-stream-name ${LOG_STREAM} --limit 5
    rm -rf out
    echo "# $FPATH OK"
}

for e in ${array_up[@]}; do
    zipUpload ${e}
done
