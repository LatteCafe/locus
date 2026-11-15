import { View } from 'react-native';

import { LocusLogo } from '@/components';
import { useTheme } from '@/theme';

/**
 * Entry route. The AuthGate redirects away from here as soon as we know who
 * the user is, so this only ever shows for a moment.
 */
export default function Index() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <LocusLogo size={72} />
    </View>
  );
}
