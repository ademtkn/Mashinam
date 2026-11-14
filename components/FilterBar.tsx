import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapPin, Sparkles, X } from 'lucide-react-native';
import { CITIES } from '../constants/cities';
import { Colors } from '../constants/colors';
import { label } from '../constants/i18n';
import { useLang } from '../context/LanguageContext';
import { PRICE_RANGES } from '../services/carService';
import type { CarFilters } from '../types/car';

interface Props {
  brands: string[];
  filters: CarFilters;
  onChange: (next: CarFilters) => void;
  resultCount: number;
  newToday: number;
  priceDrops: number;
}

function Chip({
  label: text,
  active,
  onPress,
  icon,
  accent,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        accent && styles.chipAccent,
        active && styles.chipActive,
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {icon}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text>
    </Pressable>
  );
}

function CityOption({
  label: text,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cityChip,
        active && styles.cityChipActive,
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.cityChipText, active && styles.cityChipTextActive]}>{text}</Text>
    </Pressable>
  );
}

export default function FilterBar({ brands, filters, onChange, resultCount, newToday, priceDrops }: Props) {
  const { lang, t } = useLang();
  const [cityOpen, setCityOpen] = useState(false);
  const freshLabel = [newToday > 0 && t('feed.today', { n: newToday }), priceDrops > 0 && t('feed.drops', { n: priceDrops })]
    .filter(Boolean)
    .join(' · ');
  const cityLabel = filters.city ? label.city(lang, filters.city) : t('filter.allCities');

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {/* "What's new" first: the reason to open the app again tomorrow. */}
        {freshLabel !== '' && (
          <Chip
            label={freshLabel}
            accent
            active={filters.onlyNew}
            icon={<Sparkles size={13} color={filters.onlyNew ? Colors.navy : Colors.amber} />}
            onPress={() => onChange({ ...filters, onlyNew: !filters.onlyNew })}
          />
        )}
        <Chip label={t('filter.all')} active={filters.brand === null} onPress={() => onChange({ ...filters, brand: null })} />
        {brands.map((b) => (
          <Chip
            key={b}
            label={b}
            active={filters.brand === b}
            onPress={() => onChange({ ...filters, brand: filters.brand === b ? null : b })}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip
          label={cityLabel}
          active={filters.city !== null}
          icon={<MapPin size={13} color={filters.city ? Colors.navy : Colors.amber} />}
          onPress={() => setCityOpen(true)}
        />
        {PRICE_RANGES.map((r) => (
          <Chip
            key={r.id}
            label={r.id === 'all' ? t('filter.allPrices') : r.label}
            active={filters.priceRange === r.id}
            onPress={() => onChange({ ...filters, priceRange: r.id })}
          />
        ))}
        <View style={styles.count}>
          <Text style={styles.countText}>{t('filter.count', { n: resultCount })}</Text>
        </View>
      </ScrollView>

      <Modal visible={cityOpen} transparent animationType="fade" onRequestClose={() => setCityOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCityOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('filter.cityTitle')}</Text>
              <Pressable
                onPress={() => setCityOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <X size={20} color={Colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.cityWrap} showsVerticalScrollIndicator={false}>
              <CityOption
                label={t('filter.allCities')}
                active={filters.city === null}
                onPress={() => {
                  onChange({ ...filters, city: null });
                  setCityOpen(false);
                }}
              />
              {CITIES.map((c) => (
                <CityOption
                  key={c}
                  label={label.city(lang, c)}
                  active={filters.city === c}
                  onPress={() => {
                    onChange({ ...filters, city: c });
                    setCityOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { paddingHorizontal: 14, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipAccent: { borderColor: Colors.amber },
  chipActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  chipText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.navy, fontWeight: '800' },
  count: { paddingHorizontal: 6 },
  countText: { color: Colors.textFaint, fontSize: 12, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '72%',
    backgroundColor: Colors.navyLight,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  cityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4 },
  cityChip: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityChipActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  cityChipText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  cityChipTextActive: { color: Colors.navy, fontWeight: '800' },
});
