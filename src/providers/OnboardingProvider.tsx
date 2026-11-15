import React, { createContext, useContext, useMemo, useState } from 'react';

import { DEFAULT_PREFERRED_VOLUME, type VolumeLevel } from '@/config';

/** What the onboarding screens collect before anything is written. */
export type OnboardingDraft = {
  firstName: string;
  displayName: string;
  username: string;
  schoolId: string | null;
  courses: string[];
  preferredVolume: VolumeLevel;
  referralCode: string;
};

const EMPTY_DRAFT: OnboardingDraft = {
  firstName: '',
  displayName: '',
  username: '',
  schoolId: null,
  courses: [],
  preferredVolume: DEFAULT_PREFERRED_VOLUME,
  referralCode: '',
};

type OnboardingState = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
};

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);

  const value = useMemo<OnboardingState>(
    () => ({
      draft,
      update: (patch) => setDraft((current) => ({ ...current, ...patch })),
    }),
    [draft]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingState {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return context;
}

export const ONBOARDING_STEPS = 5;
