"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  getDummyHash,
} from "@/lib/auth/password";
import { createSession, destroyCurrentSession } from "@/lib/auth/session";
import { signupSchema, loginSchema } from "@/lib/auth/validation";
import { rateLimit, rateLimitReset } from "@/lib/auth/rate-limit";
import { safeNext } from "@/lib/auth/redirect";
import { accentFromString } from "@/lib/colors";
import { abbreviateName } from "@/lib/community";

const ACCOUNT_TYPES = ["CITIZEN", "ASSOCIATION", "BUSINESS"];

export type AuthState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      values?: { name?: string; email?: string };
    }
  | undefined;

async function clientMeta() {
  const h = await headers();
  // NOTE: x-forwarded-for / x-real-ip are client-controllable unless the app
  // sits behind a trusted reverse proxy that overwrites them. The per-IP limit
  // below is therefore best-effort; the per-account limiter is the real
  // brute-force defense since it does not depend on the (spoofable) IP.
  const ip = (
    h.get("x-forwarded-for")?.split(",")[0] ??
    h.get("x-real-ip") ??
    "local"
  ).trim();
  const userAgent = h.get("user-agent");
  return { ip, userAgent };
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const rawName = String(formData.get("name") ?? "");
  const rawEmail = String(formData.get("email") ?? "");

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { name: rawName, email: rawEmail },
    };
  }

  const { name, email, password } = parsed.data;
  const { ip, userAgent } = await clientMeta();

  const rl = await rateLimit(`signup:${ip}`, 8, 60 * 60 * 1000);
  if (!rl.ok) {
    return {
      error: `Troppi tentativi. Riprova tra ${rl.retryAfterSeconds} secondi.`,
      values: { name, email },
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      fieldErrors: { email: ["Esiste già un account con questa email."] },
      values: { name, email },
    };
  }

  const rawAccountType = String(formData.get("accountType") ?? "CITIZEN");
  const accountType = ACCOUNT_TYPES.includes(rawAccountType) ? rawAccountType : "CITIZEN";

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CITIZEN",
      accountType,
      publicName: abbreviateName(name),
      avatarColor: accentFromString(name),
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "system",
      title: "Benvenuto nella Dashboard di Pistoia",
      body: "Esplora il bilancio, segui i cantieri e fai sentire la tua voce nei sondaggi della città.",
      href: "/bilancio",
    },
  });

  await createSession(user.id, { ip, userAgent });
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const rawEmail = String(formData.get("email") ?? "");

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { email: rawEmail },
    };
  }

  const { email, password } = parsed.data;
  const { ip, userAgent } = await clientMeta();

  const WINDOW = 15 * 60 * 1000;
  const pairKey = `login:${ip}:${email}`;
  const acctKey = `login-acct:${email}`; // IP-independent: caps brute-force of one account
  const ipKey = `login-ip:${ip}`; // coarse per-source cap (defense in depth)
  const limits = await Promise.all([
    rateLimit(pairKey, 5, WINDOW),
    rateLimit(acctKey, 10, WINDOW),
    rateLimit(ipKey, 40, WINDOW),
  ]);
  const blocked = limits.find((l) => !l.ok);
  if (blocked) {
    const mins = Math.max(1, Math.ceil(blocked.retryAfterSeconds / 60));
    return {
      error: `Troppi tentativi di accesso. Riprova tra ${mins} minuti.`,
      values: { email },
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  let valid = false;
  if (user) {
    valid = await verifyPassword(user.passwordHash, password);
  } else {
    // Run a verify against a real dummy hash to keep timing constant.
    await verifyPassword(await getDummyHash(), password);
  }

  if (!user || !valid) {
    return { error: "Email o password non corretti.", values: { email } };
  }

  await Promise.all([rateLimitReset(pairKey), rateLimitReset(acctKey)]);
  await createSession(user.id, { ip, userAgent });
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}
