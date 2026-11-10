import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import { callSeller, openWhatsApp } from '../../components/ActionButtons';
import { Colors } from '../../constants/colors';
import { useFavorites } from '../../context/FavoritesContext';
import { fetchCars } from '../../services/carService';
import type { Car } from '../../types/car';
import { formatPrice } from '../../utils/format';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ids, toggle } = useFavorites();
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetchCars().then(setCars);
  }, []);

  const favorites = cars.filter((c) => ids.has(c.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.heading}>Favorilerim</Text>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={52} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>Henüz favori yok</Text>
          <Text style={styles.emptyText}>
            Akışta bir fotoğrafa çift dokun ya da kalp ikonuna bas.
          </Text>
          <Pressable style={styles.cta} onPress={() => router.navigate('/')}>
            <Text style={styles.ctaText}>Keşfet'e git</Text>
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
                <Text style={styles.price}>{formatPrice(item.priceUsd)}</Text>
                <View style={styles.city}>
                  <MapPin size={13} color={Colors.textFaint} />
                  <Text style={styles.cityText}>{item.city}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => toggle(item.id)} hitSlop={8}>
                  <Heart size={22} color={Colors.danger} fill={Colors.danger} />
                </Pressable>
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: Colors.whatsapp }]}
                    onPress={() => openWhatsApp(item)}
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
  price: { color: Colors.amber, fontSize: 18, fontWeight: '900' },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { color: Colors.textFaint, fontSize: 12 },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 92 },
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
