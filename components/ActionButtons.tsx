import { useState } from 'react';
import { Alert, Animated, Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MessageCircle, Phone } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { DEMO_MODE } from '../constants/config';
import { translate, type Lang } from '../constants/i18n';
import { useLang } from '../context/LanguageContext';
import type { Car } from '../types/car';
import { formatPrice } from '../utils/format';
import { showDemoContact } from './DemoContactModal';

export const SITE_URL = 'https://ademtkn.github.io/Mashinam';
export const carUrl = (car: Car) => `${SITE_URL}/?car=${car.id}`;
const carTitle = (car: Car) => `${car.brand} ${car.model} • ${car.year}`;

function tap() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Açılamadı', 'Bu cihazda bu işlem desteklenmiyor.');
  }
}

export function openWhatsApp(car: Car, lang: Lang) {
  const digits = car.whatsappPhone.replace(/\D/g, '');
  const text = translate(lang, 'wa.message', { car: carTitle(car), price: formatPrice(car.priceUsd) });
  tap();
  if (DEMO_MODE) return showDemoContact({ kind: 'whatsapp', car, message: text });
  open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`);
}

export function callSeller(car: Car) {
  tap();
  if (DEMO_MODE) return showDemoContact({ kind: 'call', car, message: '' });
  open(`tel:${car.sellerPhone}`);
}

// Share sheet where there is one (phones, native), otherwise straight to a
// WhatsApp composer with the link — in KG a car is a family decision.
export async function shareCar(car: Car, lang: Lang) {
  const url = carUrl(car);
  const text = translate(lang, 'share.text', { car: carTitle(car), price: formatPrice(car.priceUsd), url });
  tap();
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: carTitle(car), text, url });
        return;
      } catch {
        /* user cancelled, or share not permitted: fall through */
      }
    }
    open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    return;
  }
  try {
    await Share.share(Platform.OS === 'ios' ? { message: text, url } : { message: text });
  } catch {
    /* cancelled */
  }
}

function BigButton({
  label,
  color,
  textColor,
  icon,
  onPress,
}: {
  label: string;
  color: string;
  textColor: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useState(() => new Animated.Value(1))[0];
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 8 }).start();

  return (
    <Animated.View style={[styles.flex, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => to(0.94)}
        onPressOut={() => to(1)}
        style={[styles.button, { backgroundColor: color }]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon}
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ActionButtons({ car }: { car: Car }) {
  const { lang, t } = useLang();
  return (
    <View style={styles.row}>
      <BigButton
        label={t('btn.whatsapp')}
        color={Colors.whatsapp}
        textColor={Colors.white}
        icon={<MessageCircle size={22} color={Colors.white} strokeWidth={2.4} />}
        onPress={() => openWhatsApp(car, lang)}
      />
      <BigButton
        label={t('btn.call')}
        color={Colors.amber}
        textColor={Colors.navy}
        icon={<Phone size={22} color={Colors.navy} strokeWidth={2.4} />}
        onPress={() => callSeller(car)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  button: {
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
});
