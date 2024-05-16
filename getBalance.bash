#!/usr/bin/bash
# ポリゴンテストネットのMATICトークン量、gas手数料の情報を表示する
WAIT=3
IPKEY=*****************************

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
    BALANCE_MATIC2=$( expr $BALANCE_DEC / 100000000000000 )
    BALANCE_MATIC3=$( expr ${BALANCE_MATIC1} \* 10000 )
    BALANCE_MATIC4=$( expr ${BALANCE_MATIC2} - ${BALANCE_MATIC3} )

    if [ $BALANCE_MATIC2 -lt 1000 ]; then
        RET="  $MSG $EOA: \e[31;5m$BALANCE_MATIC1.$BALANCE_MATIC4"
    elif [ $BALANCE_MATIC2 -lt 10000 ]; then
        RET="  $MSG $EOA: \e[32m$BALANCE_MATIC1.$BALANCE_MATIC4"
    else
        RET="  $MSG $EOA: $BALANCE_MATIC1.$BALANCE_MATIC4"
    fi
    eval "$3=\${RET}"
}

watch () {
  ARGS="${@}"
  clear;
  while(true); do
    echo -e "\e[0;0H"

    getBalance "NEW DEV" "0xc99c44e9115610d3e1682ffa7f2222281044e835" "A"
    getBalance "OLD DEV" "0x4f0710fa3a66ea1e8cb1f75f035e86597e629909" "B"
    getBalance "OLD STG" "0x6a55b7528152b5b7c5bacfe426e3664bd91b553a" "C"

    OUTPUT="${A}\n${B}\n${C}"
    echo -e "Every ${WAIT}.0s: MATIC Balance\n${OUTPUT}"

    GAS=$(curl https://gasstation-testnet.polygon.technology/amoy -sS --insecure)
    maxPFee=$(echo $GAS | jq -r '.safeLow.maxPriorityFee')
    maxFee=$(echo $GAS | jq -r '.safeLow.maxFee')
    BaseFee=$(echo $GAS | jq -r '.estimatedBaseFee')
    blockNumber=$(echo $GAS | jq -r '.blockNumber')

    if [ $maxPFee -gt 100 ]; then
        echo -e "\nmaxPriorityFee: \e[31;5m${maxPFee}\e[37m"
    elif [ $maxPFee -gt 50 ]; then
        echo -e "\nmaxPriorityFee: \e[32m${maxPFee}\n[37m"
    else
        echo -e "\nmaxPriorityFee: ${maxPFee}"
    fi
    echo -e "        maxFee: ${maxFee}\n       BaseFee: ${BaseFee}\n   blockNumber: ${blockNumber}"

    sleep $WAIT
  done
}

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
