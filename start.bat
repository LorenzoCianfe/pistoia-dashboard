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
  echo [ERRORE] Node.js non trovato. Installa Node 22.13+ da https://nodejs.org
  echo.
  pause
  exit /b 1
)

rem Il gestore e' pnpm e arriva da corepack, che sta dentro Node: non si
rem installa a parte. La versione la decide il campo packageManager di
rem package.json, quindi qui non se ne scrive nessuna - averla in due posti
rem significa vederle divergere.
rem
rem Si invoca "corepack pnpm ...", MAI "corepack enable" prima: enable scrive
rem gli shim in C:\Program Files\nodejs e senza permessi di amministratore
rem fallisce con EPERM (misurato in Fase 2b su questa macchina). Un avvio che
rem pretende i diritti di amministratore non e' un avvio a doppio clic.
rem Per la stessa ragione qui non si scrive mai "pnpm" nudo: nel PATH non c'e'.
where corepack >nul 2>nul
if errorlevel 1 (
  echo [ERRORE] corepack non disponibile. Serve Node 22.13 o superiore.
  echo.
  pause
  exit /b 1
)

echo [1/4] Configurazione ambiente...
call node scripts\ensure-env.mjs
if errorlevel 1 ( echo [ERRORE] impossibile creare .env & pause & exit /b 1 )

if not exist "node_modules" (
  echo [2/4] Installazione dipendenze ^(prima esecuzione, puo' richiedere qualche minuto^)...
  call corepack pnpm install --frozen-lockfile
  if errorlevel 1 ( echo [ERRORE] pnpm install fallito & pause & exit /b 1 )
) else (
  echo [2/4] Dipendenze gia' presenti.
)

if not exist "prisma\dev.db" (
  echo [3/4] Preparazione database e dati di esempio...
  call corepack pnpm exec prisma migrate deploy
  if errorlevel 1 ( echo [ERRORE] migrazione database fallita & pause & exit /b 1 )
  call corepack pnpm db:seed
  if errorlevel 1 ( echo [ERRORE] seed database fallito & pause & exit /b 1 )
) else (
  echo [3/4] Database gia' presente, applico eventuali migrazioni...
  call corepack pnpm exec prisma migrate deploy >nul 2>nul
)

echo [4/4] Avvio del server su http://localhost:3000
echo.
echo    Il browser si aprira' tra pochi secondi.
echo    Per fermare: chiudi questa finestra oppure esegui stop.bat
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 6; Start-Process 'http://localhost:3000'"
call corepack pnpm dev

endlocal
