@echo off
setlocal enableextensions
title Dashboard di Pistoia - Stop

echo Arresto del server (porta 3000)...
set "found="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /F /T /PID %%a >nul 2>nul
  if not errorlevel 1 set "found=1"
)

if defined found (
  echo Server arrestato.
) else (
  echo Nessun server in esecuzione sulla porta 3000.
)

timeout /t 2 >nul
endlocal
