import React, { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

const CONFIRM_WORD = 'DELETE';

/**
 * In-app account deletion. Apple requires this for any app with accounts, and
 * it has to actually delete — not just deactivate.
 */
export default function DeleteAccountScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();

  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmation.trim().toUpperCase() === CONFIRM_WORD;

  function onPressDelete() {
    Alert.alert(
      'Delete your account?',
      'Your profile, sessions, ratings, friends and streaks will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete forever', style: 'destructive', onPress: () => void runDelete() },
      ]
    );
  }

  async function runDelete() {
    setDeleting(true);
    const { error } = await supabase.rpc('delete_my_account');

    if (error) {
      setDeleting(false);
      Alert.alert('Could not delete your account', `${error.message}\n\nNothing was deleted.`);
      return;
    }

    // The account is gone, so clear the local session too. Any error here is
    // moot — there is no account left to stay signed in to.
    await signOut().catch(() => undefined);
    setDeleting(false);
  }

  return (
    <Screen>
      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
        <Text variant="title">This deletes everything</Text>
        <Text variant="body" tone="muted">
          Deleting your account permanently removes:
        </Text>

        <View style={{ gap: theme.spacing.sm, paddingLeft: theme.spacing.sm }}>
          {[
            'Your profile, username and referral code',
            'Every study session and all your hours',
            'Your ratings and your transcript',
            'Your friends, requests and invitations',
            'Your streaks, ranks and unlocked cosmetics',
          ].map((line) => (
            <Text key={line} variant="body" tone="muted">
              • {line}
            </Text>
          ))}
        </View>

        <Text variant="caption" tone="faint">
          Study spots you added stay on the map for everyone else, but they will no longer be linked
          to you.
        </Text>

        <View
          style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.lg,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.danger,
            backgroundColor: theme.colors.surface,
            gap: theme.spacing.md,
          }}
        >
          <Text variant="label" tone="danger">
            This cannot be undone.
          </Text>
          <TextField
            label={`Type ${CONFIRM_WORD} to confirm`}
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={CONFIRM_WORD}
          />
          <Button
            title="Delete my account"
            variant="danger"
            onPress={onPressDelete}
            disabled={!canDelete}
            loading={deleting}
          />
        </View>
      </View>
    </Screen>
  );
}
