import type { NextConfig } from "next";

// Header di sicurezza statici (Fase 0). La Content-Security-Policy non è qui:
// usa un nonce per-request e vive quindi in src/proxy.ts.
const securityHeaders = [
  // Difesa in profondità contro il clickjacking (la CSP ha già frame-ancestors).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La geolocalizzazione serve alle segnalazioni (§9); il resto è spento.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  // Ha effetto solo su HTTPS; innocuo in sviluppo locale.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const allowedOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Native modules used only on the server must be externalized so the bundler
  // doesn't try to process their .node binaries.
  serverExternalPackages: [
    "@node-rs/argon2",
    "@prisma/client",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
  ],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: {
    // Transizioni di rotta native (DESIGN.md §6): React <ViewTransition>
    // attivato dalle navigazioni dell'App Router.
    viewTransition: true,
    // Keep server action payloads small; we only pass tiny form data.
    serverActions: {
      bodySizeLimit: "1mb",
      // Dietro reverse proxy l'Origin visto da Next può differire: va
      // dichiarato esplicitamente (es. "dashboard.pistoia.it").
      ...(allowedOrigins?.length ? { allowedOrigins } : {}),
    },
  },
};

export default nextConfig;
