import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { RefreshCw, SearchX } from 'lucide-react-native';
import CarFeedCard from '../../components/CarFeedCard';
import FilterBar from '../../components/FilterBar';
import { Colors } from '../../constants/colors';
import { useFavorites } from '../../context/FavoritesContext';
import { arrangeFeed, fetchCars, filterCars, getBrands, isDefaultFilters, type FeedArrangement } from '../../services/carService';
import { useSeenCars } from '../../hooks/useSeenCars';
import { PULL_MAX, PULL_THRESHOLD, usePullToRefresh } from '../../hooks/usePullToRefresh';
import type { Car, CarFilters } from '../../types/car';

const DEFAULT_FILTERS: CarFilters = { brand: null, priceRange: 'all' };
const IS_WEB = Platform.OS === 'web';
// On web, cards this far from the active one render as an empty placeholder.
const NEAR_CARDS = 2;
// How long the scroll position must stay still before the active card changes (web).
const SETTLE_MS = 120;
// A card counts as "seen" once it has been the active card this long.
const SEEN_AFTER_MS = 1500;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle, add } = useFavorites();

  const [cars, setCars] = useState<Car[] | null>(null);
  const [filters, setFilters] = useState<CarFilters>(DEFAULT_FILTERS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [barHeight, setBarHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [seenAtLoad, setSeenAtLoad] = useState<Set<string>>(() => new Set());
  const listRef = useRef<FlatList<Car>>(null);
  const navigation = useNavigation();
  const { ready: seenReady, markSeen, snapshot: snapshotSeen } = useSeenCars();

  // Unseen listings first (shuffled), then the ones this device has already seen.
  const buildFeed = useCallback(async () => arrangeFeed(await fetchCars(), snapshotSeen()), [snapshotSeen]);
  const applyFeed = useCallback(({ cars: ordered, seenAtLoad: seenIds }: FeedArrangement) => {
    setCars(ordered);
    setSeenAtLoad(seenIds);
  }, []);

  useEffect(() => {
    if (!seenReady) return;
    let alive = true;
    buildFeed().then((feed) => {
      if (alive) applyFeed(feed);
    });
    return () => {
      alive = false;
    };
  }, [seenReady, buildFeed, applyFeed]);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  const scrollY = useRef(0);
  const sizeRef = useRef(size);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // Refresh = reload the listings. With no filter applied the unseen ones come
  // back in a new random order; with a filter applied the order is kept. Either
  // way the feed returns to the top.
  const reload = useCallback(async () => {
    if (isDefaultFilters(filtersRef.current)) applyFeed(await buildFeed());
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [buildFeed, applyFeed]);

  const { pull, refreshing, refreshNow, touchHandlers } = usePullToRefresh(reload, {
    isAtTop: () => scrollY.current <= 2,
    minStartY: insets.top + barHeight,
  });

  // Tapping the Keşfet tab while already on it refreshes, like most feed apps.
  useEffect(() => {
    return navigation.addListener('tabPress' as never, () => {
      if (navigation.isFocused()) refreshNow();
    });
  }, [navigation, refreshNow]);

  const brands = useMemo(() => getBrands(cars ?? []), [cars]);
  const visible = useMemo(() => filterCars(cars ?? [], filters), [cars, filters]);

  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [visible]);

  // Until the list reports what's on screen (or after the list changes), the first card is the active one.
  const currentId = visible.some((c) => c.id === activeId) ? activeId : (visible[0]?.id ?? null);
  const activeIndex = Math.max(0, visible.findIndex((c) => c.id === currentId));

  // The first already-seen card gets the divider, unless the feed starts with it
  // (nothing new above it to separate from).
  const dividerId = useMemo(() => {
    const idx = visible.findIndex((c) => seenAtLoad.has(c.id));
    return idx > 0 ? visible[idx].id : null;
  }, [visible, seenAtLoad]);

  // Dwelling on a card marks it as seen for next time.
  useEffect(() => {
    if (!currentId) return;
    const t = setTimeout(() => markSeen(currentId), SEEN_AFTER_MS);
    return () => clearTimeout(t);
  }, [currentId, markSeen]);

  // Web: the browser's CSS scroll-snap re-snaps to the nearest card whenever the
  // list's DOM changes mid-swipe, which made the feed jump around on its own.
  // So on web every card stays mounted (no virtualization) and the active card
  // is only updated once the scroll position has settled.
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);
  const onScroll = useCallback((y: number) => {
    scrollY.current = y;
    if (!IS_WEB) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const h = sizeRef.current.height;
      const list = visibleRef.current;
      if (!h || list.length === 0) return;
      const idx = Math.max(0, Math.min(list.length - 1, Math.round(y / h)));
      setActiveId(list[idx].id);
    }, SETTLE_MS);
  }, []);

  // FlatList requires this callback to keep the same identity for its lifetime.
  const [onViewableItemsChanged] = useState(
    () =>
      ({ viewableItems }: { viewableItems: { item: Car; isViewable: boolean }[] }) => {
        const first = viewableItems.find((v) => v.isViewable);
        if (first?.item) setActiveId(first.item.id);
      },
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Car; index: number }) => (
      <CarFeedCard
        car={item}
        width={size.width}
        height={size.height}
        topOffset={insets.top + barHeight}
        isActive={item.id === currentId}
        isNear={!IS_WEB || Math.abs(index - activeIndex) <= NEAR_CARDS}
        seenDivider={item.id === dividerId}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggle}
        onDoubleTapFavorite={add}
      />
    ),
    [size, insets.top, barHeight, currentId, activeIndex, dividerId, isFavorite, toggle, add],
  );

  return (
    <View style={styles.container} onLayout={onLayout} {...(Platform.OS === 'web' ? touchHandlers : null)}>
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
        <Animated.View
          style={[
            styles.flex,
            { transform: [{ translateY: pull.interpolate({ inputRange: [0, PULL_MAX], outputRange: [0, PULL_MAX * 0.6] }) }] },
          ]}
        >
        <FlatList
          ref={listRef}
          onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          data={visible}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={size.height}
          snapToAlignment="start"
          getItemLayout={(_, index) => ({ length: size.height, offset: size.height * index, index })}
          onViewableItemsChanged={IS_WEB ? undefined : onViewableItemsChanged}
          refreshControl={
            Platform.OS === 'web' ? undefined : (
              <RefreshControl refreshing={refreshing} onRefresh={refreshNow} tintColor={Colors.amber} />
            )
          }
          viewabilityConfig={IS_WEB ? undefined : { itemVisiblePercentThreshold: 60 }}
          windowSize={IS_WEB ? 101 : 3}
          initialNumToRender={IS_WEB ? visible.length : 2}
          maxToRenderPerBatch={IS_WEB ? visible.length : 2}
          removeClippedSubviews={!IS_WEB}
        />
        </Animated.View>
      )}

      {Platform.OS === 'web' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pullIndicator,
            {
              top: insets.top + barHeight,
              opacity: pull.interpolate({ inputRange: [0, 25], outputRange: [0, 1], extrapolate: 'clamp' }),
              transform: [
                { translateY: pull.interpolate({ inputRange: [0, PULL_MAX], outputRange: [-30, PULL_MAX * 0.6] }) },
              ],
            },
          ]}
        >
          {refreshing ? (
            <ActivityIndicator color={Colors.navy} />
          ) : (
            <Animated.View
              style={{
                transform: [
                  { rotate: pull.interpolate({ inputRange: [0, PULL_THRESHOLD], outputRange: ['0deg', '300deg'], extrapolate: 'clamp' }) },
                ],
              }}
            >
              <RefreshCw size={20} color={Colors.navy} strokeWidth={2.6} />
            </Animated.View>
          )}
        </Animated.View>
      )}

      <View
        style={[styles.bar, { paddingTop: insets.top + 8 }]}
        onLayout={(e) => setBarHeight(e.nativeEvent.layout.height - insets.top)}
        pointerEvents="box-none"
      >
        <Pressable onPress={refreshNow} style={styles.logoWrap} hitSlop={8}>
          <Text style={styles.logo}>Mashinam</Text>
        </Pressable>
        <FilterBar brands={brands} filters={filters} onChange={setFilters} resultCount={visible.length} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  flex: { flex: 1 },
  pullIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  emptyTitle: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  reset: { backgroundColor: Colors.amber, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  resetText: { color: Colors.navy, fontWeight: '800' },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 8, gap: 8 },
  logoWrap: { alignSelf: 'flex-start' },
  logo: { color: Colors.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, paddingHorizontal: 16 },
});
