import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, Phone, X } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import type { Car } from '../types/car';
import { formatPrice } from '../utils/format';

export type ContactKind = 'whatsapp' | 'call';
interface Request {
  kind: ContactKind;
  car: Car;
  message: string;
}

const listeners = new Set<(r: Request) => void>();

export function showDemoContact(r: Request) {
  listeners.forEach((l) => l(r));
}

// Mounted once in the root layout; any screen can open it via showDemoContact().
export default function DemoContactModal() {
  const [req, setReq] = useState<Request | null>(null);

  useEffect(() => {
    listeners.add(setReq);
    return () => {
      listeners.delete(setReq);
    };
  }, []);

  const close = () => setReq(null);
  const isWa = req?.kind === 'whatsapp';

  return (
    <Modal visible={req !== null} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        {req && (
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Pressable style={styles.close} onPress={close} hitSlop={10}>
              <X size={20} color={Colors.textMuted} />
            </Pressable>
            <View style={[styles.icon, { backgroundColor: isWa ? Colors.whatsapp : Colors.amber }]}>
              {isWa ? <MessageCircle size={28} color={Colors.white} /> : <Phone size={28} color={Colors.navy} />}
            </View>
            <Text style={styles.title}>Bu bir örnek ilan</Text>
            <Text style={styles.body}>
              {isWa
                ? 'Gerçek ilanlarda bu buton satıcının WhatsApp sohbetini şu mesaj hazır şekilde açar:'
                : `Gerçek ilanlarda bu buton satıcıyı (${req.car.sellerName}) tek dokunuşla arar.`}
            </Text>
            {isWa && (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{req.message}</Text>
              </View>
            )}
            <Text style={styles.car}>
              {req.car.brand} {req.car.model} • {req.car.year} — {formatPrice(req.car.priceUsd)}
            </Text>
            <Pressable style={styles.ok} onPress={close}>
              <Text style={styles.okText}>Anladım</Text>
            </Pressable>
          </Pressable>
        )}
      </Pressable>
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
  icon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.white, fontSize: 19, fontWeight: '900' },
  body: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  bubble: { alignSelf: 'stretch', backgroundColor: '#1F5C3A', borderRadius: 14, borderTopLeftRadius: 4, padding: 12 },
  bubbleText: { color: Colors.white, lineHeight: 20 },
  car: { color: Colors.amber, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  ok: { alignSelf: 'stretch', height: 50, borderRadius: 16, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  okText: { color: Colors.navy, fontWeight: '900', fontSize: 16 },
});
