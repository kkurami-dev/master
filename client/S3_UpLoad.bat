::#!/bin/bash -uex

cd I:\home\GIT_Branches\client
::npm run build

cd build
::aws s3 cp "I:\home\GIT_Branches\client\build" s3://kkurami-node-app/
aws s3 sync . s3://kkurami-node-app/

pause
