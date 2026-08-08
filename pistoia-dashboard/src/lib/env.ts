import "server-only";
import { z } from "zod";

// Validazione centralizzata delle variabili d'ambiente (Fase 0).
// L'app si rifiuta di partire con una configurazione mancante o malformata:
// un crash esplicito all'avvio è meglio di un comportamento sbagliato in silenzio.

const isProd = process.env.NODE_ENV === "production";

const TRUTHY = ["1", "true", "yes", "on"];
const FALSY = ["0", "false", "no", "off"];

const booleanString = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (v == null || v.trim() === "") return defaultValue;
      const s = v.trim().toLowerCase();
      if (TRUTHY.includes(s)) return true;
      if (FALSY.includes(s)) return false;
      ctx.addIssue({
        code: "custom",
        message: `valore booleano non valido: "${v}" (usa true/false)`,
      });
      return z.NEVER;
    });

const dataMode = z.enum(["mock", "real"]).default("mock");

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // SQLite in sviluppo; postgres:// quando si migra a Neon (vedi db.ts).
    DATABASE_URL: z.string().min(1).default("file:./prisma/dev.db"),

    // La resistenza alla contraffazione delle sessioni dipende da questo segreto.
    SESSION_SECRET: isProd
      ? z
          .string()
          .min(
            32,
            "in produzione deve essere una stringa casuale di almeno 32 caratteri",
          )
      : z.string().min(1).default("dev-only-insecure-secret-change-me"),

    // Baseline dimostrativi (baseVotes/baseLikes/recensioni finte): attivi di
    // default solo in sviluppo. In produzione i numeri partono da zero.
    DEMO_MODE: booleanString(!isProd),

    // Fonte dati per sezione: "mock" (seed) oggi, "real" quando arriva l'ETL
    // (Fase 2: BDAP per il bilancio, OpenCUP/ReGiS/ANAC per le opere).
    DATA_MODE_BILANCIO: dataMode,
    DATA_MODE_OPERE: dataMode,

    // Rate-limit distribuito (Fase 1): se impostati, il limiter usa Upstash
    // Redis via REST; altrimenti ricade sullo store in memoria per-istanza.
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Error tracking (opzionale): quando presente, instrumentation.ts lo usa.
    SENTRY_DSN: z.url().optional(),

    // Origini extra ammesse per le Server Action dietro reverse proxy
    // (lista separata da virgole, es. "dashboard.pistoia.it").
    SERVER_ACTIONS_ALLOWED_ORIGINS: z.string().optional(),

    /*
      L'origine assoluta con cui il sito parla di sé nelle MAIL (es.
      "https://dashboard.pistoia.it"). Quando c'è, i link di conferma e di
      revoca si costruiscono da qui e non dagli header della richiesta.

      ⚠️ Perché non basta leggere l'header: `Host` e `X-Forwarded-Host` li
      scrive chi chiama. Chi lasciasse una valutazione con l'indirizzo di
      un'altra persona e un host forgiato le farebbe arrivare una mail VERA,
      dal mittente vero, con il link di conferma puntato al **proprio**
      server — e quel link porta il token che conferma o cancella la
      valutazione. È l'avvelenamento del reset password applicato all'unica
      scrittura senza account della piattaforma (SECURITY.md §4).

      Resta opzionale di proposito: in sviluppo l'host cambia (3000, 3939, la
      rete locale) e imporla renderebbe il progetto scomodo senza guadagno.
      Finché non è impostata in produzione il difetto resta aperto, ed è
      scritto in ROADMAP con la condizione che lo chiude.
    */
    APP_ORIGIN: z.url().optional(),
  })
  .refine(
    (e) =>
      (e.UPSTASH_REDIS_REST_URL == null) ===
      (e.UPSTASH_REDIS_REST_TOKEN == null),
    {
      message:
        "UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN vanno impostati insieme",
      path: ["UPSTASH_REDIS_REST_URL"],
    },
  );

function loadEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const lines = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(env)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Configurazione ambiente non valida (.env):\n${lines}\n` +
        "Copia .env.example in .env e compila i valori mancanti.",
    );
  }
  return parsed.data;
}

export const env = loadEnv();

export type Env = typeof env;
