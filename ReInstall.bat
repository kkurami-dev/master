@echo OFF
@echo 環境のセットアップを行うためのバッチファイル

@echo Windows パッケージマネージャ Chocolatey の設定
:: https://community.chocolatey.org/
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

choco install -y gitextensions winmerge
choco install -y nodejs python 

choco install -y ChocolateyGUI
choco install -v google-chrome

:: choco upgrade -y all

::::::::::::::::::::::::::::::::::::::::
@echo Windows 環境変数の更新
:: SETX 変数名 値
:: SETX 変数名 値
:: SETX 変数名 値

:: 環境変数反映
:: Powershell の場合の前所処理
::$env:ChocolateyInstall = Convert-Path "$((Get-Command choco).path)\..\.."
::Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
refreshenv

::::::::::::::::::::::::::::::::::::::::
@echo npm 設定
:: https://www.npmjs.com/
:: 全体で使うモジュールを共通インストールして HD を節約
npm i -g jest eslint prettier process-env
:: プロジェクト単位で別モジュールを使う可能性がある
npm i -D @mui/material @emotion/react @emotion/styled

::::::::::::::::::::::::::::::::::::::::
@echo aws cli 設定
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
::
:: aws configre

::::::::::::::::::::::::::::::::::::::::
@echo git 設定


::::::::::::::::::::::::::::::::::::::::
@echo python 設定 ( git-remote-codecommit )
:: https://docs.aws.amazon.com/ja_jp/codecommit/latest/userguide/setting-up-git-remote-codecommit.html
curl -O https://bootstrap.pypa.io/get-pip.py
python3 get-pip.py --user
pip install git-remote-codecommit

:: git clone codecommit://CodeCommitProfile@MyDemoRepo my-demo-repo


::::::::::::::::::::::::::::::::::::::::
:: https://segakuin.com/windows/powershell/subst.html
:: net use [ドライブ文字]: https://www.box.net/dav [ログインパスワード] /user:[ログインユーザーID] /persistent:no
:: SUBST D: C:\D


::::::::::::::::::::::::::::::::::::::::
::Get-ItemProperty -Path HKLM:\Software\Microsoft\Windows\CurrentVersion -Name DevicePath
:: ウィンドウのスナップを OFF にする
reg add "HKEY_CURRENT_USER\Control Panel\Desktop" /v "WindowArrangementActive" /t REG_SZ /d "0" /f


