# ───────────────────────────────────────────────────────────────
#  Dashboard di Pistoia — immagine di esecuzione.
#
#  Base Debian (non Alpine) di proposito: better-sqlite3 e @node-rs/argon2
#  distribuiscono binari precompilati per glibc. Su musl andrebbero ricompilati
#  da sorgente, con toolchain e tempi di build molto maggiori.
# ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

# openssl serve a Prisma; ca-certificates alle chiamate HTTPS in uscita.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# pnpm arriva da corepack, che è già dentro l'immagine node:22. La versione la
# decide `packageManager` in package.json, quindi qui non si scrive un numero:
# averlo in due posti significa vederli divergere.
# `--activate` scarica e mette in cache pnpm ORA, in fase di build: l'entrypoint
# lo usa a runtime, e a runtime il container può non avere rete.
COPY package.json ./
RUN corepack enable pnpm && corepack prepare --activate

COPY . .

# Le devDependencies servono davvero: `next build` le usa, e il seed gira con
# tsx. Non si potano — e pnpm le installa per default (le toglie `--prod`).
# Il postinstall lancia `prisma generate`, che scrive il client in
# src/generated/prisma (percorso custom dello schema).
# DATABASE_URL è richiesta da prisma.config.ts anche solo per generare: qui è
# un valore usa-e-getta, quello vero arriva a runtime.
ENV DATABASE_URL="file:/tmp/build.db"
RUN pnpm install --frozen-lockfile

# src/lib/env.ts valida le variabili con Zod e blocca l'avvio se mancano.
# Segnaposto solo per superare il build; a runtime li sostituisce Coolify.
ENV SESSION_SECRET="build-time-placeholder-replaced-at-runtime-0123456789"
RUN pnpm build

# Il database vive sul volume persistente, non nell'immagine.
ENV DATABASE_URL="file:/data/pistoia.db"

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
