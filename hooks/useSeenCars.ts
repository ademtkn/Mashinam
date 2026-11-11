import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mashinam.seenCars.v1';
const SAVE_DELAY_MS = 400;

// Which listings this device has already looked at (id -> first seen time).
// Persisted so it survives reloads; on web AsyncStorage is localStorage.
export type SeenMap = Map<string, number>;

export function useSeenCars() {
  const seen = useRef<SeenMap>(new Map());
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const entries = JSON.parse(raw) as [string, number][];
        seen.current = new Map(entries);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const markSeen = useCallback((id: string) => {
    if (seen.current.has(id)) return;
    seen.current.set(id, Date.now());
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify([...seen.current])).catch(() => {});
    }, SAVE_DELAY_MS);
  }, []);

  // A copy, so the feed order computed from it doesn't shift as the user keeps browsing.
  const snapshot = useCallback((): SeenMap => new Map(seen.current), []);

  return { ready, markSeen, snapshot };
}
