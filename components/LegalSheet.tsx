import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { LEGAL, type LegalDocId } from '../constants/legal';
import { useLang } from '../context/LanguageContext';
import LegalDocumentView from './LegalDocumentView';

interface Props {
  doc: LegalDocId | null;
  onClose: () => void;
}

// A readable sheet over the current screen. Opened from the sign-in form and
// the listing form, so the user never loses the data they already typed.
export default function LegalSheet({ doc, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { lang, t } = useLang();
  const visible = doc !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {doc ? LEGAL[lang][doc].title : ''}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <X size={22} color={Colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {doc && <LegalDocumentView doc={doc} />}
          </ScrollView>
          <Pressable style={styles.closeButton} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>{t('common.close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '92%',
    backgroundColor: Colors.navyLight,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 620,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 10 },
  title: { color: Colors.white, fontSize: 20, fontWeight: '900', flex: 1 },
  content: { paddingBottom: 12 },
  closeButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  closeText: { color: Colors.navy, fontWeight: '900', fontSize: 16 },
});
