#!/bin/bash

# https://docs.aws.amazon.com/cli/latest/reference/acm/request-certificate.html

ARM=arn:aws:acm-pca:region:account:certificate-authority/12345678-1234-1234-1234-123456789012

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
