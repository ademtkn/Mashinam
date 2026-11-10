import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { PRICE_RANGES } from '../services/carService';
import type { CarFilters } from '../types/car';

interface Props {
  brands: string[];
  filters: CarFilters;
  onChange: (next: CarFilters) => void;
  resultCount: number;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function FilterBar({ brands, filters, onChange, resultCount }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Chip
          label="Tümü"
          active={filters.brand === null}
          onPress={() => onChange({ ...filters, brand: null })}
        />
        {brands.map((b) => (
          <Chip
            key={b}
            label={b}
            active={filters.brand === b}
            onPress={() => onChange({ ...filters, brand: filters.brand === b ? null : b })}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {PRICE_RANGES.map((r) => (
          <Chip
            key={r.id}
            label={r.label}
            active={filters.priceRange === r.id}
            onPress={() => onChange({ ...filters, priceRange: r.id })}
          />
        ))}
        <View style={styles.count}>
          <Text style={styles.countText}>{resultCount} ilan</Text>
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
    justifyContent: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  chipText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.navy, fontWeight: '800' },
  count: { paddingHorizontal: 6 },
  countText: { color: Colors.textFaint, fontSize: 12, fontWeight: '600' },
});
