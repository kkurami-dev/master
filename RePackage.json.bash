#!/bin/bash

set -aue

# 未使用パッケージの削除
#npx depcheck

function packagesRm(){
    MAIN=$1;
    packages=$2;

    # メインモジュール以外を一旦削除
    rmpackages=$(echo ${packages} | sed "s/ ${MAIN} / /" );
    echo "# rm package $rmpackages"
    npm rm $rmpackages
}

function nodeIni(){
    # Node.js のキャッシュクリア
    # rm -rf "C:/Program Files (x86)/Nodejs"
    # rm -rf "C:/Program Files/Nodejs"
    for path in $USERPROFILE $APPDATA $LOCALAPPDATA $TMP $TEMP
    do
        echo "rm -rf $path/npm"
        echo "rm -rf $path/npm-*"
        echo "rm -rf $path/jest"
        echo "rm -rf $path/vscode*"
    done

    # VSCode のキャッシュクリア
    echo "rm -rf $USERPROFILE/.vscode/cache"
    echo "rm -rf $USERPROFILE/.vscode/workspaceStorage"
    echo "rm -rf $APPDATA/Roaming/Code/Cache"
    echo "rm -rf $APPDATA/.vscode/cache"
    echo "rm -rf $APPDATA/.vscode/workspaceStorage"
    echo "rm -rf .vscode/workspaceStorage"
}
function packagesIni(){
    npx -p npm-check-updates -c "ncu -u"

    npm cache clean --force
    rm -rf ~/.npm
    rm -rf node_modules
    rm package-lock.json
}

function packagesI(){
    OPETION=$1;
    packages=$2;

    # モジュールをインストール
    for line in $packages
    do
        echo "# install package $line"
        npm install $OPETION $line
    done
}

# キャッシュのクリア
nodeIni

# # モジュール一覧の出力
# packages1=$(jq -c '.dependencies | keys | join(" ")' ./package.json);
# packages2=$(jq -c '.devDependencies | keys | join(" ")' ./devDependencies.json);
# 
# packagesRm 'react' "$packages1";
# packagesRm 'jest' "$packages2";
# packagesIni
# 
# # モジュールを最新化
# packagesI '' "$packages1";
# packagesI '-D'  "$packages2";
