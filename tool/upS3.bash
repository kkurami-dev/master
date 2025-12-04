#!/bin/bash

BUCKET=www.kkurami2.link

#aws s3 cp ./clock02-data.js s3://www.kkurami2.link/clock02-data.js
# aws s3 cp ./clock02-data.js s3://www.kkurami2.link/clock02-data.js --acl public-read

items=(
    clock02.html
    clock02.css
    clock02.modal.css
    clock02-data.js
    clock02.js
    sitemap.xml
    robots.txt
)
perl -i -pe 's/Ver\.(\d+)/"Ver.".($1+1)/ge' src/clock02.html
for item in "${items[@]}" ; do
    echo "[ ${item} ]"

    exe=${item##*.}
    type=""
    case ${exe} in
        "js")
            type="application/javascript";;
        "css")
            type="text/css";;
        "html")
            type="text/html";;
        "xml")
            type="text/xml";;
        "txt")
            type="text";;
        *)
            exit 1;
    esac

    aws s3 cp ./src/$item s3://$BUCKET/$item \
        --content-type $type
done
