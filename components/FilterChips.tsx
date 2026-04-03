import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { memo } from 'react';
import Colors from '../constants/colors';

export interface FilterChip {
  key: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeKey: string;
  onSelect: (key: string) => void;
}

/**
 * Striscia orizzontale di chip filtro.
 * Usato in EmployeeListScreen per role filter e team filter.
 */
const FilterChips = memo(function FilterChips({
  chips,
  activeKey,
  onSelect,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => {
        const isActive = chip.key === activeKey;
        return (
          <Pressable
            key={chip.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(chip.key)}
            android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

export default FilterChips;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceColor,
    borderWidth: 1,
    borderColor: Colors.secondaryGray + '50',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.mainTextColor,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});