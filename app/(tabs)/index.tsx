import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import CarFeedCard from '../../components/CarFeedCard';
import FilterBar from '../../components/FilterBar';
import { Colors } from '../../constants/colors';
import { useFavorites } from '../../context/FavoritesContext';
import { fetchCars, filterCars, getBrands, isDefaultFilters } from '../../services/carService';
import { shuffle } from '../../utils/shuffle';
import type { Car, CarFilters } from '../../types/car';

const DEFAULT_FILTERS: CarFilters = { brand: null, priceRange: 'all' };

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle, add } = useFavorites();

  const [cars, setCars] = useState<Car[] | null>(null);
  const [filters, setFilters] = useState<CarFilters>(DEFAULT_FILTERS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [barHeight, setBarHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<FlatList<Car>>(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCars().then(setCars);
  }, []);

  // "Refresh": with no filter applied, deal the listings in a new random order.
  // With a filter applied, keep the order and just go back to the top.
  const refresh = useCallback(() => {
    if (isDefaultFilters(filters)) setCars((prev) => (prev ? shuffle(prev) : prev));
    else listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [filters]);

  // Tapping the Keşfet tab while already on it refreshes, like most feed apps.
  useEffect(() => {
    return navigation.addListener('tabPress' as never, () => {
      if (navigation.isFocused()) refresh();
    });
  }, [navigation, refresh]);

  const brands = useMemo(() => getBrands(cars ?? []), [cars]);
  const visible = useMemo(() => filterCars(cars ?? [], filters), [cars, filters]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    setActiveId(visible[0]?.id ?? null);
  }, [visible]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { item: Car; isViewable: boolean }[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first?.item) setActiveId(first.item.id);
  }).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const renderItem = useCallback(
    ({ item }: { item: Car }) => (
      <CarFeedCard
        car={item}
        width={size.width}
        height={size.height}
        topOffset={insets.top + barHeight}
        isActive={item.id === activeId}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggle}
        onDoubleTapFavorite={add}
      />
    ),
    [size, insets.top, barHeight, activeId, isFavorite, toggle, add],
  );

  return (
    <View style={styles.container} onLayout={onLayout}>
      {cars === null || size.height === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.amber} size="large" />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.center}>
          <SearchX size={48} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>Bu filtrelere uygun ilan yok</Text>
          <Pressable style={styles.reset} onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text style={styles.resetText}>Filtreleri temizle</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={visible}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={size.height}
          snapToAlignment="start"
          getItemLayout={(_, index) => ({ length: size.height, offset: size.height * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={Colors.amber} />}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          removeClippedSubviews
        />
      )}

      <View
        style={[styles.bar, { paddingTop: insets.top + 8 }]}
        onLayout={(e) => setBarHeight(e.nativeEvent.layout.height - insets.top)}
        pointerEvents="box-none"
      >
        <Pressable onPress={refresh} style={styles.logoWrap} hitSlop={8}>
          <Text style={styles.logo}>Mashinam</Text>
        </Pressable>
        <FilterBar brands={brands} filters={filters} onChange={setFilters} resultCount={visible.length} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  emptyTitle: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  reset: { backgroundColor: Colors.amber, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  resetText: { color: Colors.navy, fontWeight: '800' },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 8, gap: 8 },
  logoWrap: { alignSelf: 'flex-start' },
  logo: { color: Colors.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, paddingHorizontal: 16 },
});
