#!/bin/bash

CMDNAME=`basename $0`
if [ $# -gt 1 ]; then
    echo "Usage: ${CMDNAME} [profile]" 1>&2
    exit 1
fi

# 第1引数でプロファイル名が指定されていたら上書きする
# (aws config でプロファイルは作成)
PROFILE="default"
if [ $# -eq 1 ]; then
    PROFILE=$1
fi

# AWSのリージョンのリストを取得する
#REGIONS=(`aws --profile ${PROFILE} ec2 describe-regions --query Regions[*].RegionName --output text`)

# リージョン毎にLambda関数のリストを出力する
#for region in ${REGIONS[@]}
echo -n "" > ./funcs.txt
for region in "ap-northeast-1"
do
    #echo "[${region}]"
    #aws --profile ${PROFILE} lambda list-functions --output text --region ${region}  --query 'Functions[*].[FunctionName, Runtime, LastModified, Description]' | sort | column -t -s "`printf '\t'`"
    #echo "---------------------"
    aws --profile ${PROFILE} lambda list-functions --output text --region ${region}  --query 'Functions[*].[FunctionName, Runtime, LastModified, Description]' >> ./funcs.txt
done

e7z='/C/Program\ Files/7-Zip/7z.exe'
echo -n "" > ./curl_cmd.sh

cat ./funcs.txt | while read line
do
    func=$(echo $line | awk '{ print $1 }')
    echo ${func}
    # リストした関数のダウンロード情報を取得
    url=$(aws lambda get-function --function-name ${func} | grep Location | awk '{ print $2 }')

    # curl でダウンロード
    rm -rf ./${func}
    echo "curl -o ${func}.zip ${url}" >> ./curl_cmd.sh

    # 7z で zip ファイルを解凍する
    echo "${e7z} x -o./${func} ./${func}.zip" >>  ./curl_cmd.sh
    echo "rm -f ./${func}.zip" >>  ./curl_cmd.sh
done
rm -f ./funcs.txt

sh ./curl_cmd.sh
rm -f ./curl_cmd.sh
