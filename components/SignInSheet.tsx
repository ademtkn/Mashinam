import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { normalizePhone, useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export const MIN_PASSWORD = 4;

// Opened by requireAuth(): the first time someone taps a heart.
export default function SignInSheet() {
  const { sheetVisible, dismissSheet, signIn } = useAuth();
  const { t } = useLang();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+996 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<'fields' | 'password' | null>(null);

  const submit = () => {
    const n = name.trim();
    const p = normalizePhone(phone);
    if (n.length < 2 || p.length < 9) return setError('fields');
    if (password.length < MIN_PASSWORD) return setError('password');
    setError(null);
    signIn({ name: n, phone: p, email: email.trim() || undefined, password, notifications: true });
  };

  return (
    <Modal visible={sheetVisible} transparent animationType="fade" onRequestClose={dismissSheet}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissSheet} />
        <View style={styles.sheet}>
          <Pressable style={styles.close} onPress={dismissSheet} hitSlop={10} accessibilityLabel={t('auth.cancel')}>
            <X size={20} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.icon}>
            <Heart size={26} color={Colors.white} fill={Colors.white} />
          </View>
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.body}>{t('auth.registerText')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.name')}
            placeholderTextColor={Colors.textFaint}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            accessibilityLabel={t('auth.name')}
          />
          <TextInput
            style={styles.input}
            placeholder={t('auth.phone')}
            placeholderTextColor={Colors.textFaint}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            accessibilityLabel={t('auth.phone')}
          />
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            placeholderTextColor={Colors.textFaint}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel={t('auth.email')}
          />
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            placeholderTextColor={Colors.textFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel={t('auth.password')}
          />
          {error === 'fields' && <Text style={styles.error}>{t('auth.invalid')}</Text>}
          {error === 'password' && <Text style={styles.error}>{t('auth.invalidPassword', { n: MIN_PASSWORD })}</Text>}
          <Pressable style={styles.submit} onPress={submit} accessibilityRole="button">
            <Text style={styles.submitText}>{t('auth.register')}</Text>
          </Pressable>
          <Pressable onPress={dismissSheet} hitSlop={8}>
            <Text style={styles.later}>{t('auth.cancel')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.navyLight,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  close: { position: 'absolute', top: 14, right: 14 },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.white, fontSize: 19, fontWeight: '900', textAlign: 'center' },
  body: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  input: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.navy,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
  submit: { alignSelf: 'stretch', height: 52, borderRadius: 16, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: Colors.navy, fontWeight: '900', fontSize: 16 },
  later: { color: Colors.textFaint, fontSize: 14, fontWeight: '600', paddingVertical: 4 },
});
