import { useCallback, useRef, useState } from 'react';
import { Animated, type GestureResponderEvent } from 'react-native';

export const PULL_THRESHOLD = 70; // px of (damped) pull needed to trigger a refresh
export const PULL_MAX = 120;
const PULL_HOLD = 56; // where the indicator rests while refreshing
const MIN_SPIN_MS = 700; // keep the spinner up long enough to be seen

interface Options {
  isAtTop: () => boolean;
  minStartY: number; // ignore touches that begin above this (e.g. on the filter bar)
}

// On web, raw touch handlers receive the DOM TouchEvent (coordinates live on
// touches[0]); on native, nativeEvent carries pageX/pageY directly.
function point(e: GestureResponderEvent) {
  const ne = e.nativeEvent as unknown as { pageX?: number; pageY?: number; touches?: ArrayLike<{ pageX: number; pageY: number }> };
  const t = ne.touches && ne.touches.length > 0 ? ne.touches[0] : ne;
  return { x: t.pageX ?? 0, y: t.pageY ?? 0 };
}

// Touch-driven pull-to-refresh for the web build, where RefreshControl does
// nothing. Native builds use RefreshControl and only need refreshNow/refreshing.
export function usePullToRefresh(onRefresh: () => Promise<void>, { isAtTop, minStartY }: Options) {
  const pull = useState(() => new Animated.Value(0))[0];
  const [refreshing, setRefreshing] = useState(false);
  const busy = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const pulling = useRef(false);
  const distance = useRef(0);

  const settle = useCallback(
    (to: number) => Animated.spring(pull, { toValue: to, useNativeDriver: false, bounciness: 4 }).start(),
    [pull],
  );

  const refreshNow = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setRefreshing(true);
    settle(PULL_HOLD);
    const t0 = Date.now();
    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        busy.current = false;
        setRefreshing(false);
        settle(0);
      }, Math.max(0, MIN_SPIN_MS - (Date.now() - t0)));
    }
  }, [onRefresh, settle]);

  const onTouchStart = (e: GestureResponderEvent) => {
    const { x, y } = point(e);
    start.current = !busy.current && y > minStartY && isAtTop() ? { x, y } : null;
    pulling.current = false;
    distance.current = 0;
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    const s = start.current;
    if (!s) return;
    const { x, y } = point(e);
    const dx = x - s.x;
    const dy = y - s.y;
    if (!pulling.current) {
      // Horizontal swipe (photo gallery) or upward scroll: not ours.
      if ((Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) || dy < -10) {
        start.current = null;
        return;
      }
      if (dy < 10 || !isAtTop()) return;
      pulling.current = true;
    }
    distance.current = Math.min(PULL_MAX, (dy - 10) * 0.5); // rubber-band damping
    pull.setValue(distance.current);
  };

  const onTouchEnd = () => {
    const wasPulling = pulling.current;
    start.current = null;
    pulling.current = false;
    if (!wasPulling) return;
    if (distance.current >= PULL_THRESHOLD) refreshNow();
    else settle(0);
  };

  return {
    pull,
    refreshing,
    refreshNow,
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd },
  };
}
