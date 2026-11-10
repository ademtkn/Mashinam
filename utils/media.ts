import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Files in /public are served by the web build under the site's base URL
// (e.g. /Mashinam on GitHub Pages). Native builds have no local web server,
// so they load the same files from the published site.
const PUBLISHED_SITE = 'https://ademtkn.github.io/Mashinam';

export function mediaUrl(file: string): string {
  if (Platform.OS === 'web') {
    const base = Constants.expoConfig?.experiments?.baseUrl ?? '';
    return `${base}/media/${file}`;
  }
  return `${PUBLISHED_SITE}/media/${file}`;
}
