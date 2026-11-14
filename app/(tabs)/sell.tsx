import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react-native';
import ConsentCheck from '../../components/ConsentCheck';
import LegalSheet from '../../components/LegalSheet';
import { CITIES } from '../../constants/cities';
import { Colors } from '../../constants/colors';
import { ADMIN_CONTACTS, LISTING_LIFETIME_DAYS } from '../../constants/config';
import { LEGAL_UPDATED, type LegalDocId } from '../../constants/legal';
import { label } from '../../constants/i18n';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import type { City, FuelType, Transmission } from '../../types/car';
import { formatKm, formatPhone, formatPrice } from '../../utils/format';
import { fullKgPhone, isValidKgPhone } from '../../utils/phone';

const FUELS: FuelType[] = ['Benzin', 'Dizel', 'Hibrit', 'Gaz/Benzin', 'Elektrik'];
const TRANSMISSIONS: Transmission[] = ['Otomatik', 'Manuel'];

type FormError = 'fields' | 'details' | 'phone' | 'claims' | 'consent' | 'open' | null;

// Listings are posted by the administrator. The form does not upload anything:
// it composes a structured Russian message and opens the admin's WhatsApp, where
// the seller attaches the photos. This keeps the prototype free and backend-less
// while giving the admin clean data instead of a free-form chat.
export default function SellScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useLang();
  const { user } = useAuth();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [fuel, setFuel] = useState<FuelType | null>(null);
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [customs, setCustoms] = useState<'cleared' | 'not' | null>(null);
  const [accident, setAccident] = useState<'free' | 'had' | null>(null);
  const [phone, setPhone] = useState('+996 ');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [preview, setPreview] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const phoneTouched = useRef(false);

  // Prefill the signed-in account's number once, without overwriting edits.
  useEffect(() => {
    if (user && !phoneTouched.current) setPhone(formatPhone(user.phone));
  }, [user]);

  const priceNum = Number(price.replace(/\D/g, ''));
  const kmNum = Number(mileage.replace(/\D/g, ''));

  // The admin reads Russian; the UI itself stays in the selected language.
  const message = useMemo(() => {
    const lines = [
      'Mashinam — заявка на объявление',
      '',
      `Марка: ${brand.trim()}`,
      `Модель: ${model.trim()}`,
      `Год: ${year.trim()}`,
      `Цена: ${formatPrice(Number.isFinite(priceNum) ? priceNum : 0)}`,
      `Пробег: ${formatKm(Number.isFinite(kmNum) ? kmNum : 0)}`,
      `Город: ${city ? label.city(lang, city) : '—'}`,
      `Топливо: ${fuel ? label.fuel(lang, fuel) : '—'}`,
      `Коробка: ${transmission ? label.transmission(lang, transmission) : '—'}`,
      `Растаможка: ${customs === 'cleared' ? 'растаможен' : customs === 'not' ? 'не растаможен' : '—'}`,
      `ДТП: ${accident === 'free' ? 'без ДТП' : accident === 'had' ? 'было ДТП' : '—'}`,
      `Телефон/WhatsApp: ${formatPhone(fullKgPhone(phone))}`,
      '',
      `Согласие: Политика конфиденциальности и Пользовательское соглашение приняты (${LEGAL_UPDATED}).`,
      'Фото: добавляю в этот чат (3–10 шт.).',
    ];
    return lines.join('\n');
  }, [accident, brand, city, customs, fuel, kmNum, lang, model, phone, priceNum, transmission, year]);

  const validate = (): FormError => {
    if (brand.trim().length < 2 || model.trim().length < 2) return 'fields';
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      return 'fields';
    }
    if (!priceNum || priceNum <= 0) return 'fields';
    if (mileage.trim() === '' || Number.isNaN(kmNum) || kmNum < 0) return 'fields';
    if (!city || !fuel || !transmission) return 'details';
    if (!isValidKgPhone(phone)) return 'phone';
    if (!customs || !accident) return 'claims';
    if (!consent) return 'consent';
    return null;
  };

  const open = (url: string) => Linking.openURL(url).catch(() => setError('open'));

  const send = () => {
    const next = validate();
    if (next) {
      setError(next);
      return;
    }
    setError(null);
    const digits = ADMIN_CONTACTS.whatsappPhone.replace(/\D/g, '');
    open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`);
  };

  const errorText =
    error === 'fields'
      ? t('sell.formInvalid')
      : error === 'details'
        ? t('sell.details')
        : error === 'phone'
        ? t('auth.phoneInvalid')
        : error === 'claims'
          ? t('sell.claimsRequired')
          : error === 'consent'
            ? t('sell.consentRequired')
            : error === 'open'
              ? t('sell.openError')
              : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t('sell.title')}</Text>
        <Text style={styles.sub}>{t('sell.sub')}</Text>

        <View style={styles.banner}>
          <ShieldCheck size={18} color={Colors.amber} />
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{t('sell.adminTitle')}</Text>
            <Text style={styles.bannerText}>{t('sell.adminText')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('sell.formTitle')}</Text>
          <Text style={styles.cardHint}>{t('sell.formText')}</Text>

          <View style={styles.row}>
            <Field
              label={t('sell.brand')}
              value={brand}
              onChangeText={(v) => {
                setBrand(v);
                setError(null);
              }}
              placeholder="Toyota"
              maxLength={40}
              style={styles.flex}
            />
            <Field
              label={t('sell.model')}
              value={model}
              onChangeText={(v) => {
                setModel(v);
                setError(null);
              }}
              placeholder="Camry"
              maxLength={40}
              style={styles.flex}
            />
          </View>

          <View style={styles.row}>
            <Field
              label={t('sell.year')}
              value={year}
              onChangeText={(v) => {
                setYear(v);
                setError(null);
              }}
              keyboard="number-pad"
              placeholder="2019"
              maxLength={4}
              style={styles.flex}
            />
            <Field
              label={t('sell.price')}
              value={price}
              onChangeText={(v) => {
                setPrice(v);
                setError(null);
              }}
              keyboard="number-pad"
              placeholder="18 500"
              maxLength={9}
              style={styles.flex}
            />
            <Field
              label={t('sell.mileage')}
              value={mileage}
              onChangeText={(v) => {
                setMileage(v);
                setError(null);
              }}
              keyboard="number-pad"
              placeholder="120 000"
              maxLength={7}
              style={styles.flex}
            />
          </View>

          <Text style={styles.label}>{t('filter.city')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityRow}
          >
            {CITIES.map((c) => (
              <OptionChip
                key={c}
                label={label.city(lang, c)}
                active={city === c}
                onPress={() => setCity(c)}
              />
            ))}
          </ScrollView>

          <Text style={styles.label}>{t('sell.fuel')}</Text>
          <View style={styles.chips}>
            {FUELS.map((f) => (
              <OptionChip
                key={f}
                label={label.fuel(lang, f)}
                active={fuel === f}
                onPress={() => setFuel(f)}
              />
            ))}
          </View>

          <Text style={styles.label}>{t('sell.transmission')}</Text>
          <View style={styles.chips}>
            {TRANSMISSIONS.map((v) => (
              <OptionChip
                key={v}
                label={label.transmission(lang, v)}
                active={transmission === v}
                onPress={() => setTransmission(v)}
              />
            ))}
          </View>

          <Text style={styles.label}>{t('sell.customs')}</Text>
          <View style={styles.chips}>
            <OptionChip
              label={t('sell.customsYes')}
              active={customs === 'cleared'}
              onPress={() => {
                setCustoms('cleared');
                setError(null);
              }}
            />
            <OptionChip
              label={t('sell.customsNo')}
              active={customs === 'not'}
              onPress={() => {
                setCustoms('not');
                setError(null);
              }}
            />
          </View>

          <Text style={styles.label}>{t('sell.accident')}</Text>
          <View style={styles.chips}>
            <OptionChip
              label={t('sell.accidentFree')}
              active={accident === 'free'}
              onPress={() => {
                setAccident('free');
                setError(null);
              }}
            />
            <OptionChip
              label={t('sell.accidentYes')}
              active={accident === 'had'}
              onPress={() => {
                setAccident('had');
                setError(null);
              }}
            />
          </View>

          <Field
            label={t('sell.phone')}
            value={phone}
            onChangeText={(v) => {
              phoneTouched.current = true;
              setPhone(v);
              setError(null);
            }}
            keyboard="phone-pad"
            placeholder={t('sell.phoneHint')}
            maxLength={20}
          />

          <ConsentCheck
            checked={consent}
            onToggle={() => {
              setConsent((v) => !v);
              if (error === 'consent') setError(null);
            }}
            text={t('sell.consent')}
            onPrivacy={() => setLegalDoc('privacy')}
            onTerms={() => setLegalDoc('terms')}
          />

          {errorText && <Text style={styles.error}>{errorText}</Text>}

          <Pressable
            style={styles.previewToggle}
            onPress={() => setPreview((v) => !v)}
            accessibilityRole="button"
          >
            <Text style={styles.previewLabel}>{t('sell.preview')}</Text>
            {preview ? (
              <ChevronUp size={18} color={Colors.amber} />
            ) : (
              <ChevronDown size={18} color={Colors.amber} />
            )}
          </Pressable>
          {preview && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText} selectable>
                {message}
              </Text>
            </View>
          )}

          <Pressable style={styles.send} onPress={send} accessibilityRole="button">
            <MessageCircle size={20} color={Colors.white} strokeWidth={2.6} />
            <Text style={styles.sendText}>{t('sell.send')}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Camera size={18} color={Colors.amber} />
            <Text style={styles.cardTitle}>{t('sell.photosTitle')}</Text>
          </View>
          <Text style={styles.cardHint}>{t('sell.photosText')}</Text>
        </View>

        <View style={styles.rules}>
          <View style={styles.rulesHeader}>
            <AlertTriangle size={18} color={Colors.amber} />
            <Text style={styles.rulesTitle}>{t('sell.rulesTitle')}</Text>
          </View>
          <Rule icon={<Clock size={16} color={Colors.amber} />} text={t('sell.rule15', { n: LISTING_LIFETIME_DAYS })} />
          <Rule icon={<Camera size={16} color={Colors.amber} />} text={t('sell.rulePhotos')} />
          <Rule icon={<ShieldCheck size={16} color={Colors.amber} />} text={t('sell.ruleHonest')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('sell.other')}</Text>
          <Pressable
            style={[styles.contact, { backgroundColor: '#2AABEE' }]}
            onPress={() => open(ADMIN_CONTACTS.telegram)}
            accessibilityRole="button"
          >
            <Send size={20} color={Colors.white} strokeWidth={2.4} />
            <Text style={[styles.contactText, { color: Colors.white }]}>Telegram</Text>
          </Pressable>
          <Pressable
            style={[styles.contact, { backgroundColor: Colors.amber }]}
            onPress={() =>
              open(`mailto:${ADMIN_CONTACTS.email}?subject=Mashinam&body=${encodeURIComponent(message)}`)
            }
            accessibilityRole="button"
          >
            <Mail size={20} color={Colors.navy} strokeWidth={2.4} />
            <Text style={[styles.contactText, { color: Colors.navy }]}>E-mail</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </KeyboardAvoidingView>
  );
}

function Field({
  label: text,
  value,
  onChangeText,
  keyboard = 'default',
  placeholder,
  maxLength,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboard?: 'default' | 'number-pad' | 'phone-pad';
  placeholder?: string;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{text}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        maxLength={maxLength}
        autoCapitalize={keyboard === 'default' ? 'words' : 'none'}
        accessibilityLabel={text}
      />
    </View>
  );
}

function OptionChip({
  label: text,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        active && styles.optionActive,
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{text}</Text>
    </Pressable>
  );
}

function Rule({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.rule}>
      {icon}
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  flex: { flex: 1 },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900' },
  sub: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: -6 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,176,32,0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.35)',
  },
  bannerTitle: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  bannerText: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  cardHint: { color: Colors.textFaint, fontSize: 12, lineHeight: 17 },
  row: { flexDirection: 'row', gap: 8 },
  field: { gap: 5 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 2 },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.navy,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityRow: { gap: 8, paddingRight: 4 },
  option: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  optionText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  optionTextActive: { color: Colors.navy, fontWeight: '800' },
  error: { color: Colors.danger, fontSize: 13 },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  previewLabel: { color: Colors.amber, fontSize: 13, fontWeight: '800' },
  bubble: {
    backgroundColor: 'rgba(37,211,102,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.35)',
    padding: 12,
  },
  bubbleText: { color: Colors.white, fontSize: 13, lineHeight: 19 },
  send: {
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.whatsapp,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 2,
  },
  sendText: { color: Colors.white, fontWeight: '900', fontSize: 17 },
  rules: {
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
  contact: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contactText: { fontSize: 16, fontWeight: '800' },
});
