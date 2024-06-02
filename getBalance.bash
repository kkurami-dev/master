#!/usr/bin/bash
# ポリゴンテストネットのMATICトークン量、gas手数料の情報を表示する
#   ・jq, curl コマンドが必須
#   ・key は alchemy.com で取得した API KEY を設定する
#   ・Git Bash で動作確認している   
#
WAIT=30
IPKEY=*************************************

ALLCOUNT=0

PutLine(){
    # 指定文字列を出力後、画面の行全体を更新する
    OUT1=$1
    OUTNUM=$(tput cols)
    for (( i=${#OUT1}; i<$OUTNUM; i++)); do
        OUT1="${OUT1} "
    done
    echo -e "${OUT1}"
}

getBalance(){
    MSG=$1
    EOA=$2

    BALANCE_HEX=$(curl https://polygon-amoy.g.alchemy.com/v2/$IPKEY \
                       -X POST --insecure -sS \
                       -H "Content-Type: application/json" \
                       -d '{"jsonrpc": "2.0", "method": "eth_getBalance", "params": ["'$EOA'"], "id": 1}' | jq -r '.result')

    # Convert Hex to Decimal
    BALANCE_DEC=$(printf '%d' ${BALANCE_HEX})

    # Convert Wei to Ether (MATIC)
    BALANCE_MATIC1=$( expr $BALANCE_DEC / 1000000000000000000 )
    BALANCE_MATIC2=$( expr $BALANCE_DEC / 1000000000000 )
    BALANCE_MATIC3=$( expr ${BALANCE_MATIC1} \* 1000000 )
    BALANCE_MATIC4=$( expr ${BALANCE_MATIC2} - ${BALANCE_MATIC3} )

    # 不足桁数の0を補完
    for (( i=${#BALANCE_MATIC4}; i<6; i++)); do
        BALANCE_MATIC4="0${BALANCE_MATIC4}"
    done

    if [ $BALANCE_MATIC2 -lt 100000 ]; then
        RET="  $MSG $EOA: \e[31;5m$BALANCE_MATIC1.$BALANCE_MATIC4 \e[37m"
    elif [ $BALANCE_MATIC2 -lt 1000000 ]; then
        RET="  $MSG $EOA: \e[32m$BALANCE_MATIC1.$BALANCE_MATIC4 \e[37m"
    else
        RET="  $MSG $EOA: $BALANCE_MATIC1.$BALANCE_MATIC4"
    fi
    PutLine "${RET}"
}

getFee(){
    # ガス手数料を公式サイトから取得し、表示する
    MSG=$1
    URL=$2
    GAS=$(curl ${URL} -sS --insecure)
    maxPFee=$(echo $GAS | jq -r '.safeLow.maxPriorityFee')
    maxFee=$(echo $GAS | jq -r '.safeLow.maxFee')
    BaseFee=$(echo $GAS | jq -r '.estimatedBaseFee')
    blockNumber=$(echo  $GAS | jq -r '.blockNumber')
    pf=${maxPFee%.*}
    mf=${maxFee%.*}

    # ブロック数の前回との差分を計算
    oldblock=${blockNumber}
    if [ $ALLCOUNT -ne 0 ]; then
        oldblock=$(eval "echo -e \${${MSG}_NUM}")
    fi
    eval "${MSG}_NUM=\${blockNumber}"
    blockdiff=$(expr $blockNumber - $oldblock)
    
    PutLine "${MSG}"
    if [ $pf -gt 100 ]; then
        PutLine "  maxPriorityFee: \e[31;5m${maxPFee} \e[37m"
    elif [ $pf -gt 31 ]; then
        PutLine "  maxPriorityFee: \e[32m${maxPFee} \e[37m"
    else
        PutLine "  maxPriorityFee: ${maxPFee}"
    fi
    if [ $mf -gt 100 ]; then
        PutLine "          maxFee: \e[31m${maxFee} \e[37m"
    elif [ $mf -gt 60 ]; then
        PutLine "          maxFee: \e[32m${maxFee} \e[37m"
    else
        PutLine "          maxFee: ${maxFee}"
    fi
    PutLine "         BaseFee: ${BaseFee}"
    PutLine "     blockNumber: ${blockNumber}(+${blockdiff})"
    PutLine "                "
}

watch(){
    clear
    while(true); do
        echo -e "\e[0;0H"
        DATE=$(date +"%Y/%m/%d %p %I:%M:%S")
        PutLine "Every ${WAIT}.0s: ${DATE} : ${ALLCOUNT}"
        PutLine "                                                     "

        # テストネットのEOA取得
        PutLine "MATIC Balance"
        getBalance "NEW DEV" "0xc99c44e9115610d3e1682ffa7f2222281044e835"
        getBalance "NEW STG" "0x78eC2078A739727B74bba6BFe55856f8EDc186e1"
        getBalance "OLD DEV" "0x4f0710fa3a66ea1e8cb1f75f035e86597e629909"
        getBalance "OLD STG" "0x6a55b7528152b5b7c5bacfe426e3664bd91b553a"
        PutLine    "                                                    "

        # 手数料の取得
        getFee "AMOY" "https://gasstation-testnet.polygon.technology/amoy"
        getFee "MAINNET" "https://gasstation.polygon.technology/v2"
        PutLine    "                                                     "

        sleep $WAIT

        # 画面サイズ変更や出力内容がたまにバグで表示がずれた場合、出力内容をすべてクリアする
        if [ $ROW -eq 0 ]; then
            ROW=$LINES
        elif [ $ROW -ne $LINES ]; then
            clear
            ROW=0
        fi

        A=$((++ALLCOUNT))
    done
}

shopt -s checkwinsize; (:;:)
ROW=0
watch

################################################################################
# https://rpc-amoy.polygon.technology 42

# https://api.polygonscan.com/api
# https://api-amoy.polygonscan.com/api

# Polygonのマニュアル
#   https://devs.polygonid.com/docs/verifier/verifier-backend/#local-installation
#   https://docs.polygon.technology/tools/gas/polygon-gas-station/

# bash の色
#   https://nainaistar.hatenablog.com/entry/2021/06/11/120000

# https://xtech.nikkei.com/it/article/COLUMN/20060227/230739/
