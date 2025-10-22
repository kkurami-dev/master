@ECHO OFF
timeout /t 5 > nul

:LOOP

::powershell -NoProfile -ExecutionPolicy Unrestricted .\KeyClick.ps1
::powershell -NoProfile -ExecutionPolicy Bypass %~dp0\KeyClick.ps1
::pwsh -v
::pwsh -NoProfile -ExecutionPolicy Bypass -File %~dp0\KeyClick.ps1
pwsh -NoProfile -ExecutionPolicy Bypass -File %~dp0\KeyClickStart.ps1

::winget install --id Microsoft.PowerShell -e

::echo .
SET /P ="." < NUL

GOTO :LOOP
