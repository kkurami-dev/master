@(echo '-*- mode: powershell  coding: shift_jis-dos; -*- Time-stamp: "2020-03-03 02:25:15 kuramitu" > NUL
echo off)

:: �i���ݒ�͊��ϐ���GUI����蓮�Őݒ肷����
set HTTP_PROXY=
set HTTPS_PROXY=
set AAA

:: �Q�l�T�C�g <http://min117.hatenablog.com/entry/2018/05/03/120949>
:: Windows10 �o�b�`�t�@�C������PowerShell�R�}���h���Ǘ��Ҍ����Ŏ��s����
:: �Ǘ��Ҍ������m�F
NET SESSION > NUL 2>&1

:: �Ǘ��҂łȂ���� -ExecutionPolicy ���Ă���ċN���s�iRESTART�j
IF %ERRORLEVEL% neq 0 goto RESTART

:: �Ǘ��Ҍ����Ȃ� PS ���Ă�Ł������s����
setlocal enableextensions
set "THIS_PATH=%~f0"
PowerShell.exe -Command "iex -Command ((gc \"%THIS_PATH:`=``%\") -join \"`n\")"

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
cd /d I:\Android\ReactNativeSample

where node
refreshenv

npm i

:: ���[�J����APK�쐬
:: https://www.robincussol.com/build-standalone-expo-apk-ipa-with-turtle-cli/

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
exit /b %errorlevel%

:RESTART
:: �Ǘ��Ҍ����ł̍ċN��
powershell -NoProfile -ExecutionPolicy unrestricted -Command "Start-Process %~f0 -Verb runas"
exit
') | sv -Name TempVar

# ������������ PowerShell�X�N���v�g���L�q����i�R�����g��REM�łȂ�#�ɂȂ�j
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
pause

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Windows�ł��R�}���h���C���ŊJ�����\�z(Chocolatey)
# <https://qiita.com/rkunihiro/items/4eab4d3e90697f064809>
choco install nvm -y
nvm list available
nvm install 10.14.2
nvm on

refreshenv
choco install python2 -y

#choco install jdk8 -y

refreshenv
npm i --global windows-build-tools
npm i -g react-native-cli
npm i -g react-native-scripts
npm i -g expo-cli
npm i -g exp
npm i -g turtle-cli
