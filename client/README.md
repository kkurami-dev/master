# Cypress で自動テスト
公式
* https://runebook.dev/ja/docs/cypress/-index-
* https://docs.cypress.io/guides/references/troubleshooting#Support-channels
* https://softwarenote.info/p1454/

はじめに
* https://qiita.com/oh_rusty_nail/items/58dcec335d67e81816dd

## セットアップ
    1. モジュールのインストール  
       $ npm i -D cypress@9.7.0 cypress-file-upload cypress-wait-until

    2. cypress/support/commands.js 追加モジュールの利用設定を追記
       import 'cypress-file-upload';
       import 'cypress-wait-until';
       
    3. 対象の URL を cypress.json に記載
       {
         "baseUrl": "http://localhost:3000"
       }

## 確認手順
    1. npm start でテスト対象を起動（ Web なら不要 )
    2. npx cypress open で起動
    3. Running integration tests で全テスト、テスト対象の選択で部分テスト
    4. 問題があれば修正（自動で再読込、再テストされる）

ディレクトリの役割
* cypress.json       : 設定を記載(確認対象の URL、テスト動画の保存)
* cypress/integration: テストコードの置き場所
* cypress/fixtures   : アップロード確認用のファイルの置き場所
* cypress/support/commands.js: 共通で使用するモジュール、関数などの記載場所
* cypress/downloads  : ダウンロードしたファイルの置き場所

## 最近の仕様変更
* 部品の非表示確認は .should('not.be.visible') ではなく.should('not.exist')   
  .should('not.be.visible') ：部品は存在するが、表示されていない  
  .should('not.exist') ：存在していない( mui などはこちら )

* 


## 参考サイト
* 複数サイト：https://qiita.com/aomoriringo/items/187af32eeac869182648
* アップロード関連：https://engineer-ninaritai.com/cypress-file-upload/
* ダウンロード関連：https://qiita.com/hi-oowada/items/ec692cf03af86d2528ce
* 設定変更など：https://runebook.dev/ja/docs/cypress/api/commands/viewport

# React の準備

## モジュールの削除（バックグランドで）
$ rm -rf ./package-lock.json ; mv node_modules node_modules_back ; rm -rf node_modules_back &  

## モジュールのインストール
$ cat ./package.json | jq -r '.dependencies| keys | .[]' | awk '{print "call npm i "$1}' > npm_ins.bat  
$ cat ./package.json | jq -r '.dependencies ' | sed 's/[{}" ]//g' | awk -F: '{print "call npm i "$1"@"$2}'  