#!/bin/bash
# -*- coding: utf-8-unix -*-

# UbuntuでEthereumのプライベートネットを作成するまで
#   <https://qiita.com/Takatoshi_Hiki/items/60b2f355ac0868a888bc>
# geth 1.9.1アップデート
#  <https://qiita.com/murata-tomohide/items/d16042536b661a22ca73>
#
#

set -v

export PATH=${HOME}/go-ethereum/build/bin:$PATH

cd ${HOME}/OpenSSL/geth

# 初回の作成
if [ ! -f geth ]; then
    geth --datadir ./ init ./genesis.json
fi

geth --networkid 10 --datadir . 2>> ./node.log console
