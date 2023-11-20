#!/bin/bash
set -ue
function usage {
    cat <<EOM
Usage: $(basename "$0") [OPTION]...
  -h          Display help
  -p VALUE    aws config profile を指定
  -f func     アップロードする関数名 (複数回の指定可能)
  -n          Lambda 関数の設定を更新しない
EOM
    exit 2
}

PROFILE=
FUNCS=()
FUNC_SETTING=1
while getopts ":p:f:n" optKey; do
    case "$optKey" in
        p)
            PROFILE=${OPTARG}
            ;;
        f)
            echo "-f = ${OPTARG}"
            FUNCS+=($OPTARG)
            ;;
        n)
            FUNC_SETTING=0
            ;;
        '-h'|'--help'|*)
            usage
            ;;
    esac
done

# プロファイル指定は必須
if [ "$PROFILE" == "" ]; then
    usage
fi

# アップロード対象の関数は最低1
if [ ${#FUNCS[*]} -ge 1 ]; then
    usage
fi

echo "profile: $PROFILE"
echo "funcs ${FUNCS[@]}"
