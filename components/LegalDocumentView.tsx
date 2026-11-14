import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { LEGAL, type LegalDocId } from '../constants/legal';
import { useLang } from '../context/LanguageContext';

// Renders one legal document. Shared by the full-screen pages and the
// in-form modal so both always show exactly the same text.
export default function LegalDocumentView({
  doc,
  showTitle = false,
}: {
  doc: LegalDocId;
  showTitle?: boolean;
}) {
  const { lang } = useLang();
  const d = LEGAL[lang][doc];

  return (
    <View style={styles.wrap}>
      {showTitle && <Text style={styles.title}>{d.title}</Text>}
      <Text style={styles.intro}>{d.intro}</Text>
      {d.sections.map((section, i) => (
        <View key={i} style={styles.section}>
          <Text style={styles.heading}>{section.title}</Text>
          {section.body.map((paragraph, j) => (
            <Text key={j} style={styles.body}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
      <Text style={styles.footer}>{d.footer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14, paddingBottom: 8 },
  title: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  intro: { color: Colors.textMuted, fontSize: 14, lineHeight: 21 },
  section: { gap: 6 },
  heading: { color: Colors.amber, fontSize: 15, fontWeight: '800', marginTop: 4 },
  body: { color: Colors.white, fontSize: 14, lineHeight: 21 },
  footer: { color: Colors.textFaint, fontSize: 12, lineHeight: 18, marginTop: 8 },
});
