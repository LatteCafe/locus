import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components';
import { suggestCorrection } from '@/lib/places';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

const KINDS = [
  { id: 'hours', label: 'Hours are wrong' },
  { id: 'name', label: 'Name is wrong' },
  { id: 'category', label: 'Wrong category' },
  { id: 'closed', label: 'Permanently closed' },
  { id: 'other', label: 'Something else' },
] as const;

type Kind = (typeof KINDS)[number]['id'];

export default function SuggestCorrectionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();

  const [kind, setKind] = useState<Kind>('hours');
  const [hours, setHours] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend =
    !saving &&
    (kind !== 'hours'
      ? message.trim().length > 0
      : hours.trim().length > 0 || message.trim().length > 0);

  async function onSend() {
    if (!session || !id) return;
    setSaving(true);
    setError(null);

    const result = await suggestCorrection({
      placeId: id,
      userId: session.user.id,
      kind,
      suggestedOpeningHours: kind === 'hours' ? hours : null,
      message,
    });

    setSaving(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    Alert.alert('Thanks', 'We will take a look.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button title="Send" onPress={onSend} disabled={!canSend} loading={saving} />
          {error ? (
            <Text variant="caption" tone="danger" center>
              {error}
            </Text>
          ) : null}
        </View>
      }
    >
      <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.md }}>
        <Text variant="body" tone="muted">
          Corrections are reviewed by hand, so a wrong edit cannot break the spot for everyone.
        </Text>

        <View style={{ gap: theme.spacing.sm }}>
          {KINDS.map((option) => {
            const active = option.id === kind;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setKind(option.id)}
                style={{
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                  backgroundColor: active ? theme.colors.accentSoft : theme.colors.surface,
                }}
              >
                <Text variant="body">{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {kind === 'hours' ? (
          <TextField
            label="Correct hours"
            value={hours}
            onChangeText={setHours}
            placeholder="Mo-Fr 08:30-22:00; Sa-Su 10:00-18:00"
            autoCapitalize="none"
            autoCorrect={false}
            hint="Day ranges and times, 24-hour clock. Or just describe them below."
          />
        ) : null}

        <TextField
          label={kind === 'hours' ? 'Anything else (optional)' : 'What is wrong?'}
          value={message}
          onChangeText={setMessage}
          placeholder="Closes at 6 during reading week"
          multiline
          numberOfLines={3}
          maxLength={280}
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />
      </View>
    </Screen>
  );
}
