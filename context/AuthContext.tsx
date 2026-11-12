import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mashinam.user.v1';

// Phase 1 "account": a name and a phone number kept on the device. Its only
// job is to own the favourites list. Phase 2 swaps this for Supabase auth
// (SMS code) without changing the screens.
export interface User {
  name: string;
  phone: string; // digits only, e.g. 996502001903
  email?: string;
  password: string; // kept locally for now; real auth comes with Supabase
  notifications: boolean; // price drops on favourites, new listings (phase 2)
}

interface AuthValue {
  user: User | null;
  ready: boolean;
  signIn: (u: User) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
  deleteAccount: () => void;
  // Run `then` now if signed in, otherwise open the sign-in sheet and run it after
  // sign-in. The user is passed in because callers' closures predate the sign-in.
  requireAuth: (then?: (u: User) => void) => void;
  sheetVisible: boolean;
  dismissSheet: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export const normalizePhone = (raw: string) => raw.replace(/\D/g, '');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const pending = useRef<((u: User) => void) | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        // Accounts created before passwords/notifications existed get defaults.
        if (raw) setUser({ password: '', notifications: true, ...(JSON.parse(raw) as Partial<User>) } as User);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback((u: User) => {
    setUser(u);
    AsyncStorage.setItem(KEY, JSON.stringify(u)).catch(() => {});
    setSheetVisible(false);
    const then = pending.current;
    pending.current = null;
    then?.(u);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Removes the account and everything stored under it on this device.
  const deleteAccount = useCallback(() => {
    setUser((prev) => {
      if (prev) AsyncStorage.removeItem(`mashinam.favorites.v1.${prev.phone}`).catch(() => {});
      return null;
    });
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const requireAuth = useCallback(
    (then?: (u: User) => void) => {
      if (user) {
        then?.(user);
        return;
      }
      pending.current = then ?? null;
      setSheetVisible(true);
    },
    [user],
  );

  const dismissSheet = useCallback(() => {
    pending.current = null;
    setSheetVisible(false);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, signIn, signOut, updateUser, deleteAccount, requireAuth, sheetVisible, dismissSheet }),
    [user, ready, signIn, signOut, updateUser, deleteAccount, requireAuth, sheetVisible, dismissSheet],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
