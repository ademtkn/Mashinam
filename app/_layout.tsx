import { useEffect } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FavoritesProvider } from '../context/FavoritesContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import SignInSheet from '../components/SignInSheet';
import { applyAndroidNavigationBar } from '../utils/navigationBar';

export default function RootLayout() {
  // iPad / Android tablets: keep the feed in a centred, phone-like column
  // instead of stretching every 9:16 card across the whole screen.
  const { width } = useWindowDimensions();
  const nativeTablet = Platform.OS !== 'web' && width >= 700;

  useEffect(() => {
    applyAndroidNavigationBar();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
      <AuthProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        {/* On desktop browsers and tablets, keep a phone-width column so the
            feed looks like the app instead of a stretched web page. */}
        <View style={[styles.outer, nativeTablet && styles.outerTablet]}>
          <View style={[styles.frame, nativeTablet && styles.frameTablet]}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.navy } }} />
          </View>
        </View>
        <SignInSheet />
      </FavoritesProvider>
      </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#050A14' : Colors.navy, alignItems: 'center' },
  outerTablet: { backgroundColor: '#050A14' },
  frame: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 460 : undefined, overflow: 'hidden' },
  frameTablet: { maxWidth: 560 },
});
