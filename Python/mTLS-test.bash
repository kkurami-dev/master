#!/bin/bash

# 相互 TLS を設定するには、以下が必要です。
#  ・カスタムドメイン名
#  ・カスタムドメイン名用の AWS Certificate Manager で構成されている少なくとも 1 つの証明書
#  ・設定され Amazon S3 にアップロードされた信頼ストア

# 使用サービス
#  1. Amazon API Gateway
#  2. Amazon S3
#  3. Amazon Certificate Manager(ACM)

# ツール
#  1. OpenSSL
#  2. Curlコマンド

curl https://748jfs5695.execute-api.ap-northeast-1.amazonaws.com/kkapi/vi/operator/test02 \
     -X GET
exit

# mTLS（Mutual TLS authentication）

# Amazon API GatewayでmTLSを試してみた。(1/2)
#  https://qiita.com/horit0123/items/8eb45bfcef6b848971a4
# Amazon API GatewayでmTLSを試してみた。 (2/2)
#  https://qiita.com/horit0123/items/d37cb939c7dc31f3c2fa

# での証明書の準備AWS Certificate Manager
#  https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/how-to-custom-domains-prerequisites.html
# AWS API Gateway mTLS - アクセスが拒否されました。理由: 自己署名証明書
#  https://stackoverflow.com/questions/73875605/aws-api-gateway-mtls-access-denied-reason-self-signed-certificate

# HTTP API の相互 TLS 認証の設定
#  https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/http-api-mutual-tls.html

APIID=4r3ki42pi3

# https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/http-api-disable-default-endpoint.html
# HTTP API のデフォルトのエンドポイントの無効化
aws apigatewayv2 update-api \
    --api-id ${APIID} \
    --disable-execute-api-endpoint

# API をデプロイ
aws apigatewayv2 create-deployment \
    --api-id ${APIID} \
    --stage-name dev

# HTTP API のカスタムドメイン名の設定
# https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/http-api-custom-domain-names.html


# aws cognito-idp admin-initiate-auth \
#     --user-pool-id ap-northeast-1_yXFT8HNNa \
#     --client-id 22deb3167bu5se5mr8cgkc5bff \
#     --auth-flow USER_PASSWORD_AUTH \
#     --auth-parameters USERNAME=admin,PASSWORD=Administrators01@

# --auth-flow ADMIN_NO_SRP_AUTH \
