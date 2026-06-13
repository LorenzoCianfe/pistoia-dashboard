import { describe, it, expect } from "vitest";
import {
  buildOnboardingSteps,
  onboardingComplete,
  type OnboardingFacts,
} from "@/lib/onboarding";

const allFalse: OnboardingFacts = {
  tourDone: false,
  hasInterests: false,
  hasVerification: false,
  hasFollow: false,
  hasParticipated: false,
};

describe("onboarding — primi passi in città (O4)", () => {
  it("produce sempre cinque passi nell'ordine atteso", () => {
    const steps = buildOnboardingSteps(allFalse);
    expect(steps.map((s) => s.key)).toEqual([
      "tour",
      "interests",
      "verify",
      "follow",
      "participate",
    ]);
    expect(steps.every((s) => !s.done)).toBe(true);
  });

  it("riflette i fatti su ogni passo", () => {
    const steps = buildOnboardingSteps({
      ...allFalse,
      tourDone: true,
      hasFollow: true,
    });
    const done = Object.fromEntries(steps.map((s) => [s.key, s.done]));
    expect(done.tour).toBe(true);
    expect(done.follow).toBe(true);
    expect(done.interests).toBe(false);
    expect(done.participate).toBe(false);
  });

  it("è completo solo quando tutti i passi sono spuntati", () => {
    expect(onboardingComplete(buildOnboardingSteps(allFalse))).toBe(false);
    const allDone: OnboardingFacts = {
      tourDone: true,
      hasInterests: true,
      hasVerification: true,
      hasFollow: true,
      hasParticipated: true,
    };
    expect(onboardingComplete(buildOnboardingSteps(allDone))).toBe(true);
  });
});
