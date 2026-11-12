import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface FavoritesValue {
  ids: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);
const keyFor = (phone: string) => `mashinam.favorites.v1.${phone}`;

// Favourites belong to the signed-in user and are kept on the device.
// Tapping a heart while signed out opens the sign-in sheet first, then applies.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, requireAuth } = useAuth();
  // The loaded list is tagged with its owner, so a stale list never shows for another user.
  const [store, setStore] = useState<{ phone: string; ids: Set<string> } | null>(null);
  const ids = useMemo(
    () => (user && store?.phone === user.phone ? store.ids : new Set<string>()),
    [user, store],
  );

  useEffect(() => {
    if (!user) return;
    const phone = user.phone;
    let alive = true;
    AsyncStorage.getItem(keyFor(phone))
      .then((raw) => {
        if (!alive) return;
        const loaded = new Set(raw ? (JSON.parse(raw) as string[]) : []);
        // Merge with anything favourited since sign-in (the first heart tap races this load).
        setStore((prev) => ({ phone, ids: prev?.phone === phone ? new Set([...prev.ids, ...loaded]) : loaded }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  const update = useCallback(
    (phone: string, fn: (prev: Set<string>) => Set<string>) => {
      setStore((prev) => {
        const next = fn(prev?.phone === phone ? prev.ids : new Set<string>());
        AsyncStorage.setItem(keyFor(phone), JSON.stringify([...next])).catch(() => {});
        return { phone, ids: next };
      });
    },
    [],
  );

  const toggle = useCallback(
    (id: string) =>
      requireAuth((u) =>
        update(u.phone, (prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      ),
    [requireAuth, update],
  );

  const add = useCallback(
    (id: string) => requireAuth((u) => update(u.phone, (prev) => (prev.has(id) ? prev : new Set(prev).add(id)))),
    [requireAuth, update],
  );

  const value = useMemo(
    () => ({ ids, isFavorite: (id: string) => ids.has(id), toggle, add }),
    [ids, toggle, add],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
