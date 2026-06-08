@echo off
setlocal enableextensions
title Dashboard di Pistoia
cd /d "%~dp0pistoia-dashboard"

echo ==========================================
echo    Dashboard di Pistoia - Avvio
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRORE] Node.js non trovato. Installa Node 20+ da https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo [1/4] Configurazione ambiente...
call node scripts\ensure-env.mjs
if errorlevel 1 ( echo [ERRORE] impossibile creare .env & pause & exit /b 1 )

if not exist "node_modules" (
  echo [2/4] Installazione dipendenze ^(prima esecuzione, puo' richiedere qualche minuto^)...
  call npm install
  if errorlevel 1 ( echo [ERRORE] npm install fallito & pause & exit /b 1 )
) else (
  echo [2/4] Dipendenze gia' presenti.
)

if not exist "prisma\dev.db" (
  echo [3/4] Preparazione database e dati di esempio...
  call npx prisma migrate deploy
  if errorlevel 1 ( echo [ERRORE] migrazione database fallita & pause & exit /b 1 )
  call npm run db:seed
  if errorlevel 1 ( echo [ERRORE] seed database fallito & pause & exit /b 1 )
) else (
  echo [3/4] Database gia' presente, applico eventuali migrazioni...
  call npx prisma migrate deploy >nul 2>nul
)

echo [4/4] Avvio del server su http://localhost:3000
echo.
echo    Il browser si aprira' tra pochi secondi.
echo    Per fermare: chiudi questa finestra oppure esegui stop.bat
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 6; Start-Process 'http://localhost:3000'"
call npm run dev

endlocal
