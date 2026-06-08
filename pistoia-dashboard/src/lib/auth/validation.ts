import { z } from "zod";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Inserisci un indirizzo email valido."));

const passwordField = z
  .string()
  .min(PASSWORD_MIN, `La password deve avere almeno ${PASSWORD_MIN} caratteri.`)
  .max(PASSWORD_MAX, "La password è troppo lunga.")
  .regex(/[a-zA-Z]/, "Deve contenere almeno una lettera.")
  .regex(/[0-9]/, "Deve contenere almeno un numero.");

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Inserisci il tuo nome (almeno 2 caratteri).")
    .max(60, "Il nome è troppo lungo."),
  email: emailField,
  password: passwordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Inserisci la password."),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome.").max(60, "Nome troppo lungo."),
  bio: z.string().trim().max(280, "La bio è troppo lunga.").optional().or(z.literal("")),
  quartiere: z.string().trim().max(60, "Valore troppo lungo.").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Inserisci la password attuale."),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Lightweight, dependency-free password strength estimate (0..4). */
export function estimatePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  let score = 0;
  if (password.length >= PASSWORD_MIN) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Molto debole", "Debole", "Discreta", "Buona", "Forte"];
  return { score: clamped, label: labels[clamped] };
}
