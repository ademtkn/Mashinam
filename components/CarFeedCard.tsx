import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Fuel, Gauge, Heart, Joystick, MapPin, Play, Volume2, VolumeX } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import type { Car, Photo } from '../types/car';
import { formatKm, formatPrice } from '../utils/format';
import ActionButtons from './ActionButtons';
import FeedVideo from './FeedVideo';

// Commons serves fixed thumbnail widths; a tiny one is plenty for the blurred fill.
const smallThumb = (uri: string) => uri.replace(/\/\d+px-/, '/330px-');

const NATIVE_DRIVER = Platform.OS !== 'web';
const DOUBLE_TAP_MS = 280;

interface Props {
  car: Car;
  width: number;
  height: number;
  topOffset: number; // space taken by the floating filter bar
  isActive: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onDoubleTapFavorite: (id: string) => void;
}

function Spec({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View style={styles.spec}>
      {icon}
      <Text style={styles.specText}>{value}</Text>
    </View>
  );
}

function CarFeedCard({
  car,
  width,
  height,
  topOffset,
  isActive,
  isFavorite,
  onToggleFavorite,
  onDoubleTapFavorite,
}: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const listRef = useRef<FlatList<Photo>>(null);
  const lastTap = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const currentIsVideo = !!car.photos[photoIndex]?.video;

  useEffect(() => () => {
    if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
  }, []);

  const reveal = useState(() => new Animated.Value(0))[0];
  const burst = useState(() => new Animated.Value(0))[0];
  const heartScale = useState(() => new Animated.Value(1))[0];

  // Info layer slides in each time the card becomes the visible one.
  useEffect(() => {
    if (!isActive) {
      reveal.setValue(0);
      return;
    }
    Animated.timing(reveal, { toValue: 1, duration: 420, useNativeDriver: NATIVE_DRIVER }).start();
  }, [isActive, reveal]);

  const popHeart = useCallback(() => {
    heartScale.setValue(0.6);
    Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 160, useNativeDriver: NATIVE_DRIVER }).start();
  }, [heartScale]);

  const handlePhotoPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      onDoubleTapFavorite(car.id);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      popHeart();
      burst.setValue(0);
      Animated.sequence([
        Animated.spring(burst, { toValue: 1, friction: 4, useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(burst, { toValue: 2, duration: 260, delay: 220, useNativeDriver: NATIVE_DRIVER }),
      ]).start();
    } else {
      lastTap.current = now;
      // Like Reels: a single tap on a video toggles sound (after ruling out a double tap).
      if (currentIsVideo) {
        singleTapTimer.current = setTimeout(() => setMuted((m) => !m), DOUBLE_TAP_MS);
      }
    }
  }, [burst, car.id, currentIsVideo, onDoubleTapFavorite, popHeart]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    setProgress(0);
  };

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(car.photos.length - 1, i));
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    setPhotoIndex(next);
    setProgress(0);
  };

  const translateY = reveal.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const burstScale = burst.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1, 1.25] });
  const burstOpacity = burst.interpolate({ inputRange: [0, 0.2, 1, 2], outputRange: [0, 1, 1, 0] });

  return (
    <View style={{ width, height, backgroundColor: Colors.navy }}>
      <FlatList
        ref={listRef}
        data={car.photos}
        keyExtractor={(p) => p.uri}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={Platform.OS === 'web' ? onScrollEnd : undefined}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        extraData={`${photoIndex}-${isActive}-${muted}`}
        renderItem={({ item, index }) => (
          <Pressable onPress={handlePhotoPress} style={{ width, height }}>
            {/* Listing photos are landscape: blurred fill behind, whole car in front. */}
            <Image
              source={{ uri: smallThumb(item.uri) }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              blurRadius={28}
              cachePolicy="memory-disk"
            />
            <View style={styles.dim} />
            {item.video ? (
              <View style={[StyleSheet.absoluteFill, !item.fullBleed && { bottom: height * 0.12 }]} pointerEvents="none">
                <FeedVideo
                  sources={item.video}
                  poster={item.uri}
                  active={isActive && index === photoIndex}
                  muted={muted}
                  cover={item.fullBleed}
                  onProgress={index === photoIndex ? setProgress : undefined}
                />
              </View>
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={[StyleSheet.absoluteFill, !item.fullBleed && { bottom: height * 0.12 }]}
                contentFit={item.fullBleed ? 'cover' : 'contain'}
                transition={250}
                cachePolicy="memory-disk"
              />
            )}
          </Pressable>
        )}
      />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(11,20,38,0.85)', 'rgba(11,20,38,0)']}
        style={[styles.topShade, { height: topOffset + 60 }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(11,20,38,0)', 'rgba(11,20,38,0.55)', 'rgba(11,20,38,0.96)']}
        locations={[0, 0.4, 1]}
        style={[styles.bottomShade, { height: height * 0.55 }]}
      />

      {currentIsVideo && (
        <>
          <View style={[styles.progressTrack, { top: topOffset }]} pointerEvents="none">
            <View style={[styles.progressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
          </View>
          <Pressable
            style={[styles.muteButton, { top: topOffset + 44 }]}
            onPress={() => setMuted((m) => !m)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Sesi aç' : 'Sesi kapat'}
          >
            {muted ? <VolumeX size={18} color={Colors.white} /> : <Volume2 size={18} color={Colors.white} />}
          </Pressable>
        </>
      )}

      {car.photos.some((p) => p.video) && !currentIsVideo && (
        <View style={[styles.videoBadge, { top: topOffset + 44 }]} pointerEvents="none">
          <Play size={12} color={Colors.navy} fill={Colors.navy} />
          <Text style={styles.videoBadgeText}>Video</Text>
        </View>
      )}

      {car.photos.length > 1 && (
        <View style={[styles.counter, { top: topOffset + 8 }]} pointerEvents="none">
          <Text style={styles.counterText}>
            {photoIndex + 1}/{car.photos.length}
          </Text>
        </View>
      )}

      {car.photos[photoIndex]?.author && (
        <Pressable
          style={[styles.credit, { top: topOffset + 8 }]}
          onPress={() => {
            const src = car.photos[photoIndex]?.source;
            if (src) Linking.openURL(src);
          }}
          hitSlop={6}
        >
          <Text style={styles.creditText} numberOfLines={1}>
            © {car.photos[photoIndex].author} · {car.photos[photoIndex].license}
          </Text>
        </Pressable>
      )}

      {Platform.OS === 'web' && car.photos.length > 1 && (
        <>
          {photoIndex > 0 && (
            <Pressable style={[styles.arrow, { left: 10 }]} onPress={() => goTo(photoIndex - 1)}>
              <ChevronLeft size={22} color={Colors.white} />
            </Pressable>
          )}
          {photoIndex < car.photos.length - 1 && (
            <Pressable style={[styles.arrow, { right: 10 }]} onPress={() => goTo(photoIndex + 1)}>
              <ChevronRight size={22} color={Colors.white} />
            </Pressable>
          )}
        </>
      )}

      <Animated.View
        pointerEvents="none"
        style={[styles.burst, { opacity: burstOpacity, transform: [{ scale: burstScale }] }]}
      >
        <Heart size={110} color={Colors.white} fill={Colors.danger} strokeWidth={1.2} />
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.bottom, { opacity: reveal, transform: [{ translateY }] }]}
      >
        <View style={styles.infoRow} pointerEvents="box-none">
          <View style={styles.info} pointerEvents="none">
            {car.photos.length > 1 && (
              <View style={styles.dots}>
                {car.photos.map((_, i) => (
                  <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
                ))}
              </View>
            )}
            <Text style={styles.title} numberOfLines={2}>
              {car.brand} {car.model} <Text style={styles.titleYear}>• {car.year}</Text>
            </Text>
            <Text style={styles.price}>{formatPrice(car.priceUsd)}</Text>
            <View style={styles.specs}>
              <Spec icon={<Fuel size={15} color={Colors.amber} />} value={car.fuel} />
              <Spec icon={<Joystick size={15} color={Colors.amber} />} value={car.transmission} />
              <Spec icon={<MapPin size={15} color={Colors.amber} />} value={car.city} />
              <Spec icon={<Gauge size={15} color={Colors.amber} />} value={formatKm(car.mileageKm)} />
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (!isFavorite) popHeart();
              onToggleFavorite(car.id);
            }}
            hitSlop={12}
            style={styles.favButton}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Heart
                size={28}
                color={isFavorite ? Colors.danger : Colors.white}
                fill={isFavorite ? Colors.danger : 'transparent'}
                strokeWidth={2.2}
              />
            </Animated.View>
          </Pressable>
        </View>

        <ActionButtons car={car} />
      </Animated.View>
    </View>
  );
}

export default memo(CarFeedCard);

const styles = StyleSheet.create({
  progressTrack: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: Colors.amber },
  muteButton: {
    position: 'absolute',
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBadge: {
    position: 'absolute',
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.amber,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoBadgeText: { color: Colors.navy, fontSize: 11, fontWeight: '800' },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,20,38,0.35)' },
  credit: {
    position: 'absolute',
    left: 14,
    maxWidth: '62%',
    backgroundColor: 'rgba(11,20,38,0.45)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  creditText: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  counter: {
    position: 'absolute',
    right: 14,
    backgroundColor: Colors.glass,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  arrow: {
    position: 'absolute',
    top: '42%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  info: { flex: 1, gap: 6 },
  dots: { flexDirection: 'row', gap: 5, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 18, backgroundColor: Colors.amber },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 8,
  },
  titleYear: { color: Colors.textMuted, fontWeight: '600' },
  price: { color: Colors.amber, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 2 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  specText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  favButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
