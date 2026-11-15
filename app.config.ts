import type { ExpoConfig } from 'expo/config';

/**
 * Expo config as TypeScript rather than app.json, so secrets can come from
 * the environment instead of being committed.
 *
 * The Google Maps key is read at build time and written into the Android
 * manifest. It is not an EXPO_PUBLIC_ variable, so it never gets inlined
 * into the JavaScript bundle.
 */
const googleMapsAndroidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? '';

const config: ExpoConfig = {
  name: 'Locus',
  slug: 'locus',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'locus',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  // The splash screen is configured through the expo-splash-screen plugin
  // below; the old top-level `splash` key no longer exists.
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.locusstudy.app',
    usesAppleSignIn: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Locus uses your location only when you check in, to confirm which study spot you are at. It never tracks you in the background.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.locusstudy.app',
    adaptiveIcon: {
      backgroundColor: '#FAF8F5',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    predictiveBackGestureEnabled: false,
    // react-native-maps uses Google Maps on Android, which refuses to draw
    // tiles without a key — the map comes up blank, with no error.
    config: googleMapsAndroidKey ? { googleMaps: { apiKey: googleMapsAndroidKey } } : undefined,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-web-browser',
    'expo-apple-authentication',
    'expo-location',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#FAF8F5',
        dark: { backgroundColor: '#131110' },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
