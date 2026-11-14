import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { LEGAL, type LegalDocId } from '../constants/legal';
import { useLang } from '../context/LanguageContext';
import LegalDocumentView from './LegalDocumentView';

// Full-screen legal page, opened from Profile (and anywhere a stable URL is
// useful). The in-form links use LegalSheet instead so no form data is lost.
export default function LegalScreen({ doc }: { doc: LegalDocId }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lang, t } = useLang();
  const title = LEGAL[lang][doc].title;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ChevronLeft size={26} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <LegalDocumentView doc={doc} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', flex: 1 },
  headerSpacer: { width: 26 },
  content: { paddingHorizontal: 18, maxWidth: 760, width: '100%', alignSelf: 'center' },
});
