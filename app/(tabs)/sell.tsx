import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

// UI only for now. Phase 2: image picker + Supabase Storage upload + insert into `cars`.
const FIELDS = [
  { key: 'brand', label: 'Marka', placeholder: 'Toyota', keyboard: 'default' },
  { key: 'model', label: 'Model', placeholder: 'Camry', keyboard: 'default' },
  { key: 'year', label: 'Yıl', placeholder: '2020', keyboard: 'number-pad' },
  { key: 'price', label: 'Fiyat ($)', placeholder: '25000', keyboard: 'number-pad' },
  { key: 'phone', label: 'Telefon / WhatsApp', placeholder: '+996 555 123 456', keyboard: 'phone-pad' },
] as const;

export default function SellScreen() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.heading}>İlan Ver</Text>
        <Text style={styles.sub}>Fotoğraf ekle, birkaç bilgi gir, yayında.</Text>

        <Pressable style={styles.photoBox}>
          <Camera size={34} color={Colors.amber} />
          <Text style={styles.photoText}>Fotoğraf ekle (en fazla 10)</Text>
        </Pressable>

        {FIELDS.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.textFaint}
              keyboardType={f.keyboard}
              value={values[f.key] ?? ''}
              onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
            />
          </View>
        ))}

        <Pressable style={styles.submit} onPress={() => setSent(true)}>
          <Text style={styles.submitText}>Yayınla</Text>
        </Pressable>
        {sent && (
          <Text style={styles.note}>
            Prototip modu: ilan yükleme Aşama 2’de Supabase ile bağlanacak.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900' },
  sub: { color: Colors.textMuted, marginTop: -6 },
  photoBox: {
    height: 150,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.amber,
    backgroundColor: Colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoText: { color: Colors.white, fontWeight: '700' },
  field: { gap: 6 },
  label: { color: Colors.textMuted, fontSize: 13, fontWeight: '700' },
  input: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.navyLight,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  submit: {
    marginTop: 6,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: Colors.navy, fontSize: 17, fontWeight: '900' },
  note: { color: Colors.amber, textAlign: 'center', fontSize: 13 },
});
