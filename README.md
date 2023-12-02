# 初期設定

## 管理者ユーザのコンソールで

- インストール：https://chocolatey.org/install
  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

- パッケージ：https://community.chocolatey.org/packages
  choco install vscode -y

## 一般ユーザのコンソールで

npm i -g prettier eslint react-devtools

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
