#!/bin/bash

ARM=arn:aws:acm-pca:region:account:certificate-authority/12345678-1234-1234-1234-123456789012

# プライベートキーの作成
# https://docs.aws.amazon.com/cli/latest/reference/acm/request-certificate.html
aws acm request-certificate \
    --domain-name www.example.com \
    --idempotency-token 12563 \
    --region ap-northeast-1 \
    --options CertificateTransparencyLoggingPreference=DISABLED \
    --certificate-authority-arn ${ARM} \
    --tags UUID=AAAAAAAAAAAAAAAAAAAAAAAAAAAA

# 
# {
#     "CertificateArn": "arn:aws:acm:region:account:certificate/12345678-1234-1234-1234-123456789012"
# }
#

# ACM 証明書フィールドを取得する
# <https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/gs-acm-describe.html>
aws acm describe-certificate --certificate-arn ${ARM}

# CLI を使用したプライベート証明書のエクスポート
# <https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/gs-acm-export-private.html>
aws acm export-certificate \
    --certificate-arn ${ARM} \
    --passphrase file://path-to-passphrase-file  \
    | jq -r '"\(.Certificate)\(.CertificateChain)\(.PrivateKey)"'


