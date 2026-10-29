@echo off
rem Double-click to start the local server and open the page.
rem Optional: pass a different port, e.g.  start.bat 3001
set PORT=%1
if "%PORT%"=="" set PORT=3000
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port %PORT%
pause
