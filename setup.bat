@(echo '-*- mode: powershell  coding: shift_jis-dos; -*- Time-stamp: "2020-03-03 02:05:12 kuramitu" > NUL
echo off)

:: 永続設定は環境変数のGUIから手動で設定すこと
set HTTP_PROXY=
set HTTPS_PROXY=
set ???

:: 参考サイト <http://min117.hatenablog.com/entry/2018/05/03/120949>
:: Windows10 バッチファイル内でPowerShellコマンドを管理者権限で実行する
:: 管理者権限か確認
NET SESSION > NUL 2>&1

:: 管理者でなければ -ExecutionPolicy してから再起実行（RESTART）
IF %ERRORLEVEL% neq 0 goto RESTART

:: 管理者権限なら PS を呼んで★を実行する
setlocal enableextensions
set "THIS_PATH=%~f0"
PowerShell.exe -Command "iex -Command ((gc \"%THIS_PATH:`=``%\") -join \"`n\")"

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
cd /d I:\Android\ReactNativeSample

where node
refreshenv

expo install react-navigation
expo install react-navigation-stack
expo install react-navigation-tabs
expo install react-native-gesture-handler
expo install react-native-reanimated
expo install react-navigation-material-bottom-tabs
expo install react-native-paper

npm i react-native-safe-area-context
npm i react-native-screens
npm i react-navigation-drawer
npm i react-native-vector-icons
npm i @egjs/hammerjs

::npm ls react-native
::npm ls expo
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
exit /b %errorlevel%

:RESTART
:: 管理者権限での再起動
powershell -NoProfile -ExecutionPolicy unrestricted -Command "Start-Process %~f0 -Verb runas"
exit
') | sv -Name TempVar

# ★ここから先に PowerShellスクリプトを記述する（コメントもREMでなく#になる）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
pause

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Windowsでもコマンドラインで開発環境構築(Chocolatey)
# <https://qiita.com/rkunihiro/items/4eab4d3e90697f064809>
choco install nvm -y
nvm install 10.14.2
nvm on

refreshenv
choco install python2 -y

#choco install jdk8 -y

refreshenv
npm i -g react-native-cli
npm i -g react-native-scripts
npm i -g expo-cli
npm i -g exp
