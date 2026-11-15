import React from 'react';

import { Screen } from '@/components';
import { LegalText } from '@/components/LegalText';

/** Placeholder terms of use. */
export default function TermsScreen() {
  return (
    <Screen>
      <LegalText
        updated="15 November 2026"
        intro="By using Locus you agree to these terms."
        sections={[
          {
            heading: 'Who can use Locus',
            body: [
              'You must be at least 13 years old, and old enough to agree to these terms where you live.',
              'One account per person. Keep your sign-in details to yourself.',
            ],
          },
          {
            heading: 'Studying honestly',
            body: [
              'Hours, streaks and ranks are meant to reflect time you actually spent studying.',
              'Checking in somewhere you are not, leaving a timer running while you are elsewhere, or otherwise inflating your hours may get those sessions excluded from leaderboards.',
              'We review unusual patterns by hand. We do not stop you from checking in, and a bad GPS reading on its own is not cheating.',
            ],
          },
          {
            heading: 'Content you add',
            body: [
              'You are responsible for the spots, photos, ratings and invitations you post. Do not post anything unlawful, abusive, or that you do not have the right to share.',
              'Keep spot information accurate and useful: other students rely on it.',
              'We may remove content or suspend accounts that break these terms.',
            ],
          },
          {
            heading: 'Other people',
            body: [
              'Be decent to other users. Harassment gets your account removed.',
              'Do not use Locus to follow, monitor or turn up uninvited on anyone.',
            ],
          },
          {
            heading: 'What Locus is not',
            body: [
              'Opening hours, noise levels and other spot details come from public data and from other students. They may be wrong or out of date. Check before relying on them.',
              'Locus is provided as-is, without a warranty that it will always be available or accurate.',
            ],
          },
          {
            heading: 'Changes and contact',
            body: [
              'We may update these terms. We will note the date at the top when we do.',
              'Questions: [add a contact email before launch].',
            ],
          },
        ]}
      />
    </Screen>
  );
}
