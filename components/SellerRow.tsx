import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { useLang } from '../context/LanguageContext';
import type { Car } from '../types/car';
import { daysLeft, isNew, timeAgo } from '../utils/time';

const AVATAR_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#F97316'];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// Instagram-style account line: who is selling and when.
export default function SellerRow({ car }: { car: Car }) {
  const { lang, t } = useLang();
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(car.sellerName) }]}>
        <Text style={styles.initial}>{car.sellerName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {car.sellerName}
      </Text>
      <Text style={styles.time} numberOfLines={1}>
        · {timeAgo(car.createdAt, lang)}
      </Text>
      {isNew(car.createdAt) ? (
        <View style={styles.newBadge}>
          <Text style={styles.newText}>{t('card.new')}</Text>
        </View>
      ) : (
        <Text style={[styles.time, daysLeft(car.createdAt) <= 3 && styles.expiring]} numberOfLines={1}>
          · {t('card.daysLeft', { n: daysLeft(car.createdAt) })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  initial: { color: Colors.white, fontWeight: '900', fontSize: 13 },
  name: { color: Colors.white, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  time: { color: Colors.textFaint, fontSize: 12, flexShrink: 0 },
  expiring: { color: Colors.amber },
  newBadge: { backgroundColor: '#10B981', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  newText: { color: Colors.navy, fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
});
