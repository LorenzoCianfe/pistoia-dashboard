// Onboarding "primi passi in città" (O4): la checklist progressiva delle
// prime azioni utili. Pura logica (testabile senza Prisma): i fatti arrivano
// dal data layer, qui si decide quali passi esistono e quando sono completi.

export type OnboardingFacts = {
  tourDone: boolean;
  hasInterests: boolean;
  hasVerification: boolean; // richiesta o già verificato
  hasFollow: boolean;
  hasParticipated: boolean; // voto, sostegno, "anche io", adesione o domanda
};

export type OnboardingStepKey =
  | "tour"
  | "interests"
  | "verify"
  | "follow"
  | "participate";

export type OnboardingStep = { key: OnboardingStepKey; done: boolean };

/** I passi nell'ordine in cui li proponiamo. */
export function buildOnboardingSteps(f: OnboardingFacts): OnboardingStep[] {
  return [
    { key: "tour", done: f.tourDone },
    { key: "interests", done: f.hasInterests },
    { key: "verify", done: f.hasVerification },
    { key: "follow", done: f.hasFollow },
    { key: "participate", done: f.hasParticipated },
  ];
}

export function onboardingComplete(steps: OnboardingStep[]): boolean {
  return steps.every((s) => s.done);
}
