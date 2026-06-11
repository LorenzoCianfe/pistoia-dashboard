import type { Instrumentation } from "next";

// Bootstrap di osservabilità (Fase 0).
// register() valida l'ambiente all'avvio: una configurazione rotta blocca il
// boot con un messaggio chiaro invece di fallire a runtime davanti al cittadino.
export async function register() {
  const { env } = await import("@/lib/env");
  console.log(
    `[pistoia] avvio: env=${env.NODE_ENV} demo=${env.DEMO_MODE} ` +
      `bilancio=${env.DATA_MODE_BILANCIO} opere=${env.DATA_MODE_OPERE} ` +
      `rate-limit=${env.UPSTASH_REDIS_REST_URL ? "upstash" : "memoria"}`,
  );
}

// Hook nativo Next per gli errori server non gestiti: log strutturato (JSON,
// una riga) pronto per qualsiasi log collector. Quando ci sarà un DSN Sentry
// (env.SENTRY_DSN) basterà inoltrare da qui.
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(
    JSON.stringify({
      at: new Date().toISOString(),
      kind: "request-error",
      message: e.message,
      digest: (e as { digest?: string }).digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      stack: e.stack?.split("\n").slice(0, 6).join(" | "),
    }),
  );
};
