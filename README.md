# 🏛️ Dashboard di Pistoia

> I dati pubblici del Comune di Pistoia, finalmente leggibili.

Piattaforma civica che trasforma **bilancio, opere, sondaggi e segnalazioni** in un'unica app
moderna, chiara e veloce — pensata per i cittadini, non per i ragionieri.

> ⚠️ **Progetto dimostrativo:** i dati mostrati sono di esempio (mock) e non rappresentano fonti
> ufficiali. L'autenticazione è invece reale e sicura.

---

## ✨ Funzionalità

- **Bilancio** — i 142 mln della città in un colpo d'occhio: anelli di riscossione/impegni/PNRR,
  andamento mensile, spesa per missione.
- **Opere** — cantieri con percentuale di avanzamento in tempo reale e indicatori aggregati.
- **Sondaggi** — il Comune chiede, i cittadini votano (in tempo reale, con UI ottimistica).
- **Comunità** — feed "la città risponde": domande pubbliche e risposte ufficiali verificate.
- **Extra** — organigramma della giunta, centro notifiche, profilo, impostazioni, **area admin**.
- **Login sicuro** — Argon2id, sessioni server-side, rate-limiting, validazione.
- **Tema chiaro/scuro**, design responsive con i colori di Pistoia, animazioni morbide.

## 🚀 Avvio rapido (Windows)

Doppio click su **`start.bat`**: installa le dipendenze, prepara il database con i dati di esempio e
avvia l'app su <http://localhost:3000>. Per fermarla: **`stop.bat`**.

### Avvio manuale (qualsiasi sistema)

```bash
cd pistoia-dashboard
npm install
npm run setup     # crea il DB + migrazioni + dati mockup
npm run dev       # http://localhost:3000
```

**Account dimostrativi**

| Ruolo | Email | Password |
|---|---|---|
| Cittadino | `cittadino@pistoia.it` | `Pistoia2026` |
| Comune (admin) | `comune@pistoia.it` | `Comune2026!` |

## 🧱 Stack

**Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4** ·
**Prisma 7** + **SQLite** · **Motion** · **next-themes** · **Zod**

## 📚 Documentazione

Architettura, modello dati, modello di sicurezza e changelog: vedi **[DOCUMENTATION.md](DOCUMENTATION.md)**.
Vision e concept originale: **[pistoia-dashboard-concept.txt](pistoia-dashboard-concept.txt)**.

---

Progetto di **Lorenzo Cianferoni**.
