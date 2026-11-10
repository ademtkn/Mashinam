import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FavoritesProvider } from '../context/FavoritesContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        {/* On desktop browsers, keep a phone-width column so the feed looks like the app. */}
        <View style={styles.outer}>
          <View style={styles.frame}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.navy } }} />
          </View>
        </View>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#050A14' : Colors.navy, alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 460 : undefined, overflow: 'hidden' },
});
