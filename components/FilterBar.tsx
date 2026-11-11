import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Colors } from '../constants/colors';
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
  label,
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
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function FilterBar({ brands, filters, onChange, resultCount, newToday, priceDrops }: Props) {
  const { t } = useLang();
  const freshLabel = [newToday > 0 && t('feed.today', { n: newToday }), priceDrops > 0 && t('feed.drops', { n: priceDrops })]
    .filter(Boolean)
    .join(' · ');

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
});
