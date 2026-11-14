import { NavigationBar } from 'expo-navigation-bar';

// SDK 58 exposes a declarative NavigationBar. `dark` gives a dark bar with
// light system buttons; the Android theme's window background is already navy.
// `enforceContrast: false` in app.json stops Android from painting a white
// contrast scrim over it.
export function applyAndroidNavigationBar() {
  NavigationBar.setStyle('dark');
}
