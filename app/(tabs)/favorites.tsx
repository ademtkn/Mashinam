import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, LogOut, MapPin, MessageCircle, Phone, Share2, UserRound } from 'lucide-react-native';
import { callSeller, openWhatsApp, shareCar } from '../../components/ActionButtons';
import { Colors } from '../../constants/colors';
import { label } from '../../constants/i18n';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useLang } from '../../context/LanguageContext';
import { fetchCars } from '../../services/carService';
import type { Car } from '../../types/car';
import { formatPrice } from '../../utils/format';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ids, toggle } = useFavorites();
  const { user, requireAuth, signOut } = useAuth();
  const { lang, t } = useLang();
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetchCars().then(setCars);
  }, []);

  const favorites = cars.filter((c) => ids.has(c.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.heading}>{t('fav.title')}</Text>

      {user && (
        <View style={styles.account}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{user.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.accountPhone}>+{user.phone}</Text>
          </View>
          <Pressable onPress={signOut} style={styles.signOut} hitSlop={8} accessibilityRole="button">
            <LogOut size={16} color={Colors.textMuted} />
            <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
          </Pressable>
        </View>
      )}

      {!user ? (
        <View style={styles.empty}>
          <UserRound size={52} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('auth.title')}</Text>
          <Text style={styles.emptyText}>{t('fav.signInHint')}</Text>
          <Pressable style={styles.cta} onPress={() => requireAuth()} accessibilityRole="button">
            <Text style={styles.ctaText}>{t('auth.submit')}</Text>
          </Pressable>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={52} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('fav.emptyTitle')}</Text>
          <Text style={styles.emptyText}>{t('fav.emptyText')}</Text>
          <Pressable style={styles.cta} onPress={() => router.navigate('/')}>
            <Text style={styles.ctaText}>{t('fav.cta')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.photos[0].uri }} style={styles.thumb} contentFit="cover" />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.brand} {item.model} • {item.year}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(item.priceUsd)}</Text>
                  {item.oldPriceUsd !== undefined && item.oldPriceUsd > item.priceUsd && (
                    <Text style={styles.oldPrice}>{formatPrice(item.oldPriceUsd)}</Text>
                  )}
                </View>
                <View style={styles.city}>
                  <MapPin size={13} color={Colors.textFaint} />
                  <Text style={styles.cityText}>{label.city(lang, item.city)}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <View style={styles.actionRow}>
                  <Pressable onPress={() => shareCar(item, lang)} hitSlop={8}>
                    <Share2 size={20} color={Colors.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => toggle(item.id)} hitSlop={8}>
                    <Heart size={22} color={Colors.danger} fill={Colors.danger} />
                  </Pressable>
                </View>
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: Colors.whatsapp }]}
                    onPress={() => openWhatsApp(item, lang)}
                  >
                    <MessageCircle size={18} color={Colors.white} />
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: Colors.amber }]}
                    onPress={() => callSeller(item)}
                  >
                    <Phone size={18} color={Colors.navy} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900', paddingHorizontal: 16 },
  account: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center' },
  initial: { color: Colors.navy, fontWeight: '900', fontSize: 18 },
  accountInfo: { flex: 1 },
  accountName: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  accountPhone: { color: Colors.textFaint, fontSize: 12 },
  signOut: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  signOutText: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  cta: { marginTop: 8, backgroundColor: Colors.amber, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  ctaText: { color: Colors.navy, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
  },
  thumb: { width: 92, height: 92, borderRadius: 12 },
  info: { flex: 1, gap: 4 },
  title: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: Colors.amber, fontSize: 18, fontWeight: '900' },
  oldPrice: { color: Colors.textFaint, fontSize: 12, textDecorationLine: 'line-through' },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { color: Colors.textFaint, fontSize: 12 },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 92 },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
