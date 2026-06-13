import "server-only";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/dal";
import {
  buildOnboardingSteps,
  onboardingComplete,
  type OnboardingStep,
} from "@/lib/onboarding";

// Onboarding "primi passi in città" (O4): i fatti vengono dai dati reali
// dell'utente — la checklist si completa da sola usando la piattaforma.

export type OnboardingState = {
  steps: OnboardingStep[];
  complete: boolean;
  /** True quando la checklist non va mostrata (nascosta o completata). */
  hidden: boolean;
};

export async function getOnboardingState(user: CurrentUser): Promise<OnboardingState> {
  const [follows, votes, supports, confirms, joins, questions, qtVotes, verifications] =
    await Promise.all([
      prisma.follow.count({ where: { userId: user.id } }),
      prisma.vote.count({ where: { userId: user.id } }),
      prisma.proposalSupport.count({ where: { userId: user.id } }),
      prisma.reportConfirmation.count({ where: { userId: user.id } }),
      prisma.initiativeJoin.count({ where: { userId: user.id } }),
      prisma.qtQuestion.count({ where: { authorId: user.id } }),
      prisma.qtVote.count({ where: { userId: user.id } }),
      prisma.profileVerification.count({ where: { userId: user.id } }),
    ]);

  const steps = buildOnboardingSteps({
    tourDone: user.tourCompletedAt !== null,
    hasInterests: user.civicInterests.length > 0,
    hasVerification: user.verifiedType !== null || verifications > 0,
    hasFollow: follows > 0,
    hasParticipated:
      votes + supports + confirms + joins + questions + qtVotes > 0,
  });
  const complete = onboardingComplete(steps);

  return {
    steps,
    complete,
    hidden: complete || user.onboardingDismissedAt !== null,
  };
}
