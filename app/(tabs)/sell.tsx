import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Camera, Clock, Mail, MessageCircle, Send, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { ADMIN_CONTACTS, LISTING_LIFETIME_DAYS } from '../../constants/config';
import { useLang } from '../../context/LanguageContext';

// Listings are posted by the administrator only. This screen just gets the
// seller in touch and sets expectations (15-day lifetime, photos, honesty).
export default function SellScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const message = encodeURIComponent(t('sell.message'));
  const digits = ADMIN_CONTACTS.whatsappPhone.replace(/\D/g, '');
  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.heading}>{t('sell.title')}</Text>
      <View style={styles.adminCard}>
        <View style={styles.adminIcon}>
          <ShieldCheck size={26} color={Colors.navy} />
        </View>
        <Text style={styles.adminTitle}>{t('sell.adminTitle')}</Text>
        <Text style={styles.adminText}>{t('sell.adminText')}</Text>
      </View>

      <Pressable
        style={[styles.contact, { backgroundColor: Colors.whatsapp }]}
        onPress={() => open(`https://wa.me/${digits}?text=${message}`)}
        accessibilityRole="button"
      >
        <MessageCircle size={22} color={Colors.white} strokeWidth={2.4} />
        <Text style={[styles.contactText, { color: Colors.white }]}>WhatsApp</Text>
      </Pressable>
      <Pressable
        style={[styles.contact, { backgroundColor: '#2AABEE' }]}
        onPress={() => open(ADMIN_CONTACTS.telegram)}
        accessibilityRole="button"
      >
        <Send size={22} color={Colors.white} strokeWidth={2.4} />
        <Text style={[styles.contactText, { color: Colors.white }]}>Telegram</Text>
      </Pressable>
      <Pressable
        style={[styles.contact, { backgroundColor: Colors.amber }]}
        onPress={() => open(`mailto:${ADMIN_CONTACTS.email}?subject=Mashinam&body=${message}`)}
        accessibilityRole="button"
      >
        <Mail size={22} color={Colors.navy} strokeWidth={2.4} />
        <Text style={[styles.contactText, { color: Colors.navy }]}>E-mail</Text>
      </Pressable>

      <View style={styles.rules}>
        <View style={styles.rulesHeader}>
          <AlertTriangle size={18} color={Colors.amber} />
          <Text style={styles.rulesTitle}>{t('sell.rulesTitle')}</Text>
        </View>
        <View style={styles.rule}>
          <Clock size={16} color={Colors.amber} />
          <Text style={styles.ruleText}>{t('sell.rule15', { n: LISTING_LIFETIME_DAYS })}</Text>
        </View>
        <View style={styles.rule}>
          <Camera size={16} color={Colors.amber} />
          <Text style={styles.ruleText}>{t('sell.rulePhotos')}</Text>
        </View>
        <View style={styles.rule}>
          <ShieldCheck size={16} color={Colors.amber} />
          <Text style={styles.ruleText}>{t('sell.ruleHonest')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900', marginBottom: 4 },
  adminCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  adminIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center' },
  adminTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  adminText: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  contact: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contactText: { fontSize: 17, fontWeight: '800' },
  rules: {
    marginTop: 6,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(255,176,32,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.5)',
  },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rulesTitle: { color: Colors.amber, fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },
  rule: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  ruleText: { color: Colors.white, flex: 1, lineHeight: 20, fontSize: 14 },
});
