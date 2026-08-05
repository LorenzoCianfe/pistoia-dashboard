#!/bin/sh
# Avvio del container: migrazioni, seed alla prima esecuzione, poi Next.js.
set -e

echo "[entrypoint] applico le migrazioni al database su volume..."
# `migrate deploy` e non `migrate dev`: applica solo le migrazioni già
# versionate, senza generarne di nuove e senza mai proporre un reset.
npx prisma migrate deploy

if [ ! -f /data/.seeded ]; then
  echo "[entrypoint] database nuovo — carico i dati dimostrativi..."
  npm run db:seed
  touch /data/.seeded
  echo "[entrypoint] seed completato."
else
  echo "[entrypoint] seed già eseguito in passato, lo salto."
fi

echo "[entrypoint] avvio Next.js sulla porta ${PORT:-3000}..."
# -H 0.0.0.0 è necessario in container: sul loopback il proxy non arriverebbe.
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
