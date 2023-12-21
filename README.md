# 参考資料
## https://uguisu.skr.jp/othello/

## 追加機能済み
・複数回の試合を実行できるようにする
・NPCとNPCで戦う
・NPCのロジックを複数選ぶ（レベル）
・勝敗を表示
・白と黒の取得数を表示

## 追加機能
・プレイヤーを後攻にする
・先攻／後攻のプレイヤー、NPCを選べるようにする
・ネットワーク対戦
・差し戻し
・棋譜
・AI学習
・高レベルNPC
・勝率
・ユーザーの登録
・先攻が自分以外の場合、相手の指してを実行
・

# 初期設定

## 管理者ユーザのコンソールで

- インストール：https://chocolatey.org/install
  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

- パッケージ：https://community.chocolatey.org/packages
  choco install vscode -y

## シンボリックリンク
* 
* サーバ上でのリンクの有効か
現在の設定を確認
> fsutil behavior query symlinkevaluation

## 一般ユーザのコンソールで

npm i -g prettier eslint react-devtools

npm i -g eslint-plugin-eslint-comments

# VSCode

## ショートカット：

基本:
https://qiita.com/12345/items/64f4372fbca041e949d0

画面分割：
https://confrage.jp/visual-studio-codeでショートカットキーでファイルを分割表示/

## Emacs 風：

Awesome Emacs Keymap
https://github.com/whitphx/vscode-emacs-mcx

Ctrl+Shift+\キーで対応する括弧（カッコ）にカーソルを移動することができます。

VSCode の折り畳みと展開のショートカット一覧
https://rishuntrading.co.jp/blog/tools/vs-code_fold_unforld/
