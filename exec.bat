@ECHO OFF
SET PYTHONHOME=C:\Python38
SET PYTHONPATH=C:\Python38\lib
::SET PYTHONHOME=C:\Python27
::SET PYTHONPATH=C:\Python27\lib

:: 環境
:: c:\python38\python.exe -m pip install --upgrade pip

:: 追加モジュール
::  配列
:: pip install numpy
::  グラフ描画
:: pip install matplotlib
:: goto :BATEND

::CMD
::PAUSE
::::::::::::::::::::::::::::::::::::::::
:: インストール済みのパッケージ一覧を取得
::   choco list -localonly
::   clist -lo

:: choco upgrade -y git

::::::::::::::::::::::::::::::::::::::::
@ECHO ON
py --version

python hungry.py

:BATEND
@ECHO --- BATEND ---
PAUSE
EXIT
