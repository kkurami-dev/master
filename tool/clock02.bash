#!/bin/bash

set -aeux

terser clock02.js -m -c > temp.js
javascript-obfuscator temp.js \
    --output .clock02-pack.js \
    --compact true \
    --control-flow-flattening true \
    --control-flow-flattening-threshold 0.75 \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.4 \
    --debug-protection false \
    --disable-console-output true \
    --identifier-names-generator 'hexadecimal' \
    --log false \
    --rename-globals false \
    --string-array-rotate true \
    --self-defending true \
    --string-array true \
    --string-array-encoding 'base64' \
    --string-array-threshold 0.75 \
    --transform-object-keys true \
    --unicode-escape-sequence false

    #--debug-protection-interval false \

rm -rf temp.js
