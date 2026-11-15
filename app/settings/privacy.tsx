import React from 'react';

import { Screen } from '@/components';
import { LegalText } from '@/components/LegalText';

/**
 * Placeholder privacy policy. The wording below describes what the app
 * actually does today, so it is a useful starting point for the real one.
 */
export default function PrivacyScreen() {
  return (
    <Screen>
      <LegalText
        updated="15 November 2026"
        intro="Locus is a study-spot app for university students. This policy explains what we collect, why, and what you can switch off."
        sections={[
          {
            heading: 'What we collect',
            body: [
              'Your account details: email address, first name, username, school, course codes and your preferred noise level.',
              'Your study sessions: which spot you checked in at, when you started and stopped, how long you paused, and an optional course code.',
              'Your check-in location: a single location reading taken at the moment you check in, plus how far that was from the spot. We use it to confirm you are where you say you are.',
              'Your ratings of study spots.',
            ],
          },
          {
            heading: 'Location, specifically',
            body: [
              'Locus asks for location only while you are using the app. We never track you in the background and the app cannot see where you are when it is closed.',
              'We take one location reading when you check in. We do not record a trail of where you go.',
              'Nobody can see where you are studying unless you turn on "Share sessions with friends", and even then only friends you have accepted can see it. It is off by default and you can turn it off at any time in Settings.',
              'Leaderboards show hours studied and streaks. They never show where anyone is or has been.',
            ],
          },
          {
            heading: 'What other people can see',
            body: [
              'Your username, display name, avatar and school are visible to other Locus users, so friends can find you.',
              'Your ratings feed into each spot’s public scores as anonymous averages. Other people cannot see which spots you personally rated.',
              'Your hours and streaks appear on leaderboards for your friends and for your school.',
            ],
          },
          {
            heading: 'Who we share it with',
            body: [
              'We do not sell your data, and we do not share it with advertisers.',
              'We use Supabase to store data and run the service, and Expo to build and update the app. They process data on our behalf.',
            ],
          },
          {
            heading: 'Deleting your account',
            body: [
              'You can delete your account from Settings at any time. It permanently removes your profile, sessions, ratings, friendships, streaks and cosmetics.',
              'Study spots you added stay on the map for other users, but they are no longer linked to you.',
            ],
          },
          {
            heading: 'Contact',
            body: ['Questions about this policy: [add a contact email before launch].'],
          },
        ]}
      />
    </Screen>
  );
}
