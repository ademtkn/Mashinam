import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Heart, MessageCircle, X } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { LOCAL_AUTH_DEMO } from '../constants/config';
import type { LegalDocId } from '../constants/legal';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { formatPhone } from '../utils/format';
import { fullKgPhone, isValidKgPhone } from '../utils/phone';
import ConsentCheck from './ConsentCheck';
import LegalSheet from './LegalSheet';

const RESEND_SECONDS = 30;

// Opened by requireAuth(): the first time someone taps a heart. One screen for
// the phone, one for the WhatsApp code — no password, no e-mail, no long form.
export default function SignInSheet() {
  const { sheetVisible, dismissSheet, signIn } = useAuth();
  const { t } = useLang();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+996 ');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<'phone' | 'consent' | 'code' | null>(null);
  const [demoCode, setDemoCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);

  const codeRef = useRef('');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const reset = useCallback(() => {
    setStep('phone');
    setCode('');
    setError(null);
    setDemoCode('');
    setResendIn(0);
    setVerifiedPhone('');
    codeRef.current = '';
  }, []);

  const closeSheet = useCallback(() => {
    reset();
    dismissSheet();
  }, [dismissSheet, reset]);

  useEffect(() => {
    if (step !== 'code' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(id);
  }, [step, resendIn]);

  const makeCode = useCallback(() => {
    const next = String(Math.floor(100000 + Math.random() * 900000));
    codeRef.current = next;
    setDemoCode(next);
    setCode('');
    setError(null);
    setResendIn(RESEND_SECONDS);
  }, []);

  const sendCode = useCallback(() => {
    if (!isValidKgPhone(phone)) {
      setError('phone');
      return;
    }
    if (!consent) {
      setError('consent');
      return;
    }
    setVerifiedPhone(fullKgPhone(phone));
    makeCode();
    setStep('code');
  }, [consent, makeCode, phone]);

  const verify = useCallback(() => {
    if (code.trim() !== codeRef.current) {
      setError('code');
      return;
    }
    signIn({
      name: name.trim() || t('auth.defaultName'),
      phone: verifiedPhone,
      notifications: true,
    });
    reset();
  }, [code, name, reset, signIn, t, verifiedPhone]);

  const resend = useCallback(() => {
    if (resendIn > 0) return;
    makeCode();
  }, [makeCode, resendIn]);

  return (
    <>
      <Modal visible={sheetVisible} transparent animationType="fade" onRequestClose={closeSheet}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          <View style={styles.sheet}>
            <Pressable
              style={styles.close}
              onPress={closeSheet}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <X size={20} color={Colors.textMuted} />
            </Pressable>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.icon}>
                <Heart size={26} color={Colors.white} fill={Colors.white} />
              </View>
              <Text style={styles.title}>
                {step === 'phone' ? t('auth.oneStepTitle') : t('auth.codeTitle')}
              </Text>
              <Text style={styles.body}>
                {step === 'phone'
                  ? t('auth.oneStepText')
                  : t('auth.codeText', { phone: formatPhone(verifiedPhone) })}
              </Text>

              {step === 'phone' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.nameOptional')}
                    placeholderTextColor={Colors.textFaint}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    accessibilityLabel={t('auth.nameOptional')}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.phoneLabel')}
                    placeholderTextColor={Colors.textFaint}
                    value={phone}
                    onChangeText={(v) => {
                      setPhone(v);
                      if (error) setError(null);
                    }}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    accessibilityLabel={t('auth.phoneLabel')}
                  />
                  <Text style={styles.hint}>{t('auth.phoneHint')}</Text>

                  <ConsentCheck
                    checked={consent}
                    onToggle={() => {
                      setConsent((v) => !v);
                      if (error === 'consent') setError(null);
                    }}
                    text={t('auth.consent')}
                    onPrivacy={() => setLegalDoc('privacy')}
                    onTerms={() => setLegalDoc('terms')}
                  />

                  {error === 'phone' && <Text style={styles.error}>{t('auth.phoneInvalid')}</Text>}
                  {error === 'consent' && (
                    <Text style={styles.error}>{t('auth.consentRequired')}</Text>
                  )}

                  <Pressable style={styles.submit} onPress={sendCode} accessibilityRole="button">
                    <MessageCircle size={18} color={Colors.navy} strokeWidth={2.7} />
                    <Text style={styles.submitText}>{t('auth.sendCode')}</Text>
                  </Pressable>

                  <View style={styles.channelRow}>
                    <Text style={styles.channel}>WhatsApp</Text>
                    {LOCAL_AUTH_DEMO && (
                      <Text style={styles.demoBadge}>{t('auth.localDemo')}</Text>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    value={code}
                    onChangeText={(v) => {
                      setCode(v);
                      if (error) setError(null);
                    }}
                    placeholder="000000"
                    placeholderTextColor={Colors.textFaint}
                    keyboardType="number-pad"
                    maxLength={6}
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    autoFocus
                    accessibilityLabel={t('auth.codeLabel')}
                  />
                  {LOCAL_AUTH_DEMO && demoCode !== '' && (
                    <View style={styles.demoPill}>
                      <Text style={styles.demoText}>
                        {t('auth.demoCode', { code: demoCode })}
                      </Text>
                    </View>
                  )}
                  {error === 'code' && <Text style={styles.error}>{t('auth.codeInvalid')}</Text>}

                  <Pressable style={styles.submit} onPress={verify} accessibilityRole="button">
                    <Text style={styles.submitText}>{t('auth.verify')}</Text>
                  </Pressable>

                  <View style={styles.codeActions}>
                    <Pressable onPress={resend} disabled={resendIn > 0} hitSlop={8}>
                      <Text style={[styles.secondary, resendIn > 0 && styles.secondaryDisabled]}>
                        {resendIn > 0 ? t('auth.resendIn', { n: resendIn }) : t('auth.resend')}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setStep('phone');
                        setError(null);
                      }}
                      hitSlop={8}
                    >
                      <Text style={styles.secondary}>{t('auth.changePhone')}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Pressable onPress={closeSheet} hitSlop={8}>
                <Text style={styles.later}>{t('auth.cancel')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: Colors.navyLight,
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  content: { alignItems: 'center', gap: 10, paddingBottom: 4 },
  close: { position: 'absolute', top: 14, right: 14, zIndex: 2 },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: Colors.white, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  body: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20, fontSize: 14 },
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
  hint: { alignSelf: 'flex-start', color: Colors.textFaint, fontSize: 11, marginTop: -4 },
  codeInput: { textAlign: 'center', fontSize: 26, letterSpacing: 8, fontWeight: '800' },
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
  submit: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.amber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitText: { color: Colors.navy, fontWeight: '900', fontSize: 16 },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  channel: { color: Colors.textFaint, fontSize: 11, fontWeight: '700' },
  demoBadge: {
    color: Colors.amber,
    fontSize: 10,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.5)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  demoPill: {
    backgroundColor: 'rgba(255,176,32,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.4)',
  },
  demoText: { color: Colors.amber, fontSize: 13, fontWeight: '800' },
  codeActions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  secondary: { color: Colors.amber, fontSize: 13, fontWeight: '700' },
  secondaryDisabled: { color: Colors.textFaint },
  later: { color: Colors.textFaint, fontSize: 14, fontWeight: '600', paddingVertical: 4 },
});
