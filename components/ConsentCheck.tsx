import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useLang } from '../context/LanguageContext';

interface Props {
  checked: boolean;
  onToggle: () => void;
  text: string;
  onPrivacy: () => void;
  onTerms: () => void;
}

// The consent block shared by sign-in and the listing form. The checkbox stays
// unchecked until the user actively taps it; the links open the legal sheet.
export default function ConsentCheck({ checked, onToggle, text, onPrivacy, onTerms }: Props) {
  const { t } = useLang();

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.row}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.box, checked && styles.boxOn]}>
          {checked && <Check size={14} color={Colors.navy} strokeWidth={3.4} />}
        </View>
        <Text style={styles.text}>{text}</Text>
      </Pressable>
      <View style={styles.links}>
        <Pressable onPress={onPrivacy} hitSlop={6}>
          <Text style={styles.link}>{t('legal.privacy')}</Text>
        </Pressable>
        <Text style={styles.dot}>·</Text>
        <Pressable onPress={onTerms} hitSlop={6}>
          <Text style={styles.link}>{t('legal.terms')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', gap: 6, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  text: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, flex: 1 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  link: { color: Colors.amber, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  dot: { color: Colors.textFaint, fontSize: 12 },
});
