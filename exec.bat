@ECHO OFF
SET PYTHONHOME=C:\Python38
SET PYTHONPATH=C:\Python38\lib
::SET PYTHONHOME=C:\Python27
::SET PYTHONPATH=C:\Python27\lib

:: ��
:: c:\python38\python.exe -m pip install --upgrade pip

:: �ǉ����W���[��
::  �z��
:: pip install numpy
::  �O���t�`��
:: pip install matplotlib
:: goto :BATEND

::CMD
::PAUSE
::::::::::::::::::::::::::::::::::::::::
:: �C���X�g�[���ς݂̃p�b�P�[�W�ꗗ���擾
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
