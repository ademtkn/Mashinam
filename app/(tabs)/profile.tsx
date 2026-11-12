import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Heart, LogOut, Trash2, UserRound } from 'lucide-react-native';
import { MIN_PASSWORD } from '../../components/SignInSheet';
import { Colors } from '../../constants/colors';
import { normalizePhone, useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useLang } from '../../context/LanguageContext';

// Account settings. Everything is on-device until Supabase auth arrives;
// the screen is written so only the storage layer needs to change.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { user, requireAuth, signOut, updateUser, deleteAccount } = useAuth();
  const { ids } = useFavorites();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<'fields' | 'password' | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load the form from the account whenever it changes (sign-in, save, sign-out).
  useEffect(() => {
    const u = user;
    const id = setTimeout(() => {
      setName(u?.name ?? '');
      setPhone(u ? `+${u.phone}` : '');
      setEmail(u?.email ?? '');
      setPassword('');
      setConfirmDelete(false);
    }, 0);
    return () => clearTimeout(id);
  }, [user]);

  // Any edit after a save turns "Saved" back into "Save".
  const edited = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setSaved(false);
  };

  const save = () => {
    const n = name.trim();
    const p = normalizePhone(phone);
    if (n.length < 2 || p.length < 9) return setError('fields');
    if (password && password.length < MIN_PASSWORD) return setError('password');
    setError(null);
    updateUser({ name: n, phone: p, email: email.trim() || undefined, ...(password ? { password } : {}) });
    setPassword('');
    setSaved(true);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.heading}>{t('tab.profile')}</Text>
        <View style={styles.empty}>
          <UserRound size={52} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('profile.guestTitle')}</Text>
          <Text style={styles.emptyText}>{t('profile.guestText')}</Text>
          <Pressable style={styles.cta} onPress={() => requireAuth()} accessibilityRole="button">
            <Text style={styles.ctaText}>{t('auth.register')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>{t('tab.profile')}</Text>

      <View style={styles.card}>
        <View style={styles.accountRow}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{user.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.accountName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.accountSub}>+{user.phone}</Text>
          </View>
          <View style={styles.favPill}>
            <Heart size={13} color={Colors.danger} fill={Colors.danger} />
            <Text style={styles.favPillText}>{t('profile.favCount', { n: ids.size })}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('profile.edit')}</Text>
        <Field label={t('auth.name')} value={name} onChange={edited(setName)} />
        <Field label={t('auth.phone')} value={phone} onChange={edited(setPhone)} keyboard="phone-pad" />
        <Field label={t('auth.email')} value={email} onChange={edited(setEmail)} keyboard="email-address" />
        <Field label={t('profile.newPassword')} value={password} onChange={edited(setPassword)} secure />
        {error === 'fields' && <Text style={styles.error}>{t('auth.invalid')}</Text>}
        {error === 'password' && <Text style={styles.error}>{t('auth.invalidPassword', { n: MIN_PASSWORD })}</Text>}
        <Pressable style={styles.primary} onPress={save} accessibilityRole="button">
          <Text style={styles.primaryText}>{saved ? t('profile.saved') : t('profile.save')}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.rowCard]}>
        <View style={styles.iconBubble}>
          <Bell size={18} color={Colors.amber} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>{t('profile.notifications')}</Text>
          <Text style={styles.rowSub}>{t('profile.notificationsText')}</Text>
        </View>
        <Switch
          value={user.notifications}
          onValueChange={(v) => updateUser({ notifications: v })}
          trackColor={{ true: Colors.amber, false: Colors.navySoft }}
          thumbColor={Colors.white}
          accessibilityLabel={t('profile.notifications')}
        />
      </View>

      <Pressable style={[styles.card, styles.rowCard]} onPress={signOut} accessibilityRole="button">
        <View style={styles.iconBubble}>
          <LogOut size={18} color={Colors.white} />
        </View>
        <Text style={[styles.rowTitle, styles.flex]}>{t('auth.signOut')}</Text>
      </Pressable>

      <View style={[styles.card, styles.dangerCard]}>
        <View style={styles.rowCardInner}>
          <View style={[styles.iconBubble, styles.dangerBubble]}>
            <Trash2 size={18} color={Colors.danger} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: Colors.danger }]}>{t('profile.delete')}</Text>
            <Text style={styles.rowSub}>{t('profile.deleteText')}</Text>
          </View>
        </View>
        {confirmDelete ? (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>{t('profile.deleteConfirm')}</Text>
            <Pressable style={styles.confirmNo} onPress={() => setConfirmDelete(false)} accessibilityRole="button">
              <Text style={styles.confirmNoText}>{t('profile.no')}</Text>
            </Pressable>
            <Pressable style={styles.confirmYes} onPress={deleteAccount} accessibilityRole="button">
              <Text style={styles.confirmYesText}>{t('profile.yes')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.dangerButton} onPress={() => setConfirmDelete(true)} accessibilityRole="button">
            <Text style={styles.dangerButtonText}>{t('profile.delete')}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboard,
  secure,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'phone-pad' | 'email-address';
  secure?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        secureTextEntry={secure}
        autoCapitalize={keyboard === 'email-address' || secure ? 'none' : 'words'}
        placeholderTextColor={Colors.textFaint}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  flex: { flex: 1 },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900', paddingHorizontal: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  cta: { marginTop: 8, backgroundColor: Colors.amber, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  ctaText: { color: Colors.navy, fontWeight: '800' },
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cardTitle: { color: Colors.white, fontWeight: '800', fontSize: 15, marginBottom: 2 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center' },
  initial: { color: Colors.navy, fontWeight: '900', fontSize: 20 },
  accountName: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  accountSub: { color: Colors.textFaint, fontSize: 12 },
  favPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.navy, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  favPillText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  field: { gap: 5 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.navy,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  error: { color: Colors.danger, fontSize: 13 },
  primary: { height: 48, borderRadius: 14, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  primaryText: { color: Colors.navy, fontWeight: '900', fontSize: 15 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBubble: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  rowSub: { color: Colors.textFaint, fontSize: 12, marginTop: 2 },
  dangerCard: { borderColor: 'rgba(255,77,94,0.45)' },
  dangerBubble: { backgroundColor: 'rgba(255,77,94,0.12)' },
  dangerButton: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger, alignItems: 'center', justifyContent: 'center' },
  dangerButtonText: { color: Colors.danger, fontWeight: '800' },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  confirmText: { color: Colors.white, fontWeight: '700', flex: 1 },
  confirmNo: { paddingHorizontal: 14, height: 40, borderRadius: 12, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
  confirmNoText: { color: Colors.white, fontWeight: '700' },
  confirmYes: { paddingHorizontal: 14, height: 40, borderRadius: 12, backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center' },
  confirmYesText: { color: Colors.white, fontWeight: '800' },
});
