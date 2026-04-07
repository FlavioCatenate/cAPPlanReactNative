import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useCallback } from 'react';
import Colors from '../constants/colors';

export type ProjectStatusFilter = 'active' | 'expiring' | 'completed';

export interface ProjectFilters {
  selectedStatuses: ProjectStatusFilter[];
}

export const EMPTY_PROJECT_FILTERS: ProjectFilters = {
  selectedStatuses: [],
};

export function countProjectFilters(filters: ProjectFilters): number {
  return filters.selectedStatuses.length;
}

const STATUS_OPTIONS: { value: ProjectStatusFilter; label: string; color: string }[] = [
  { value: 'active',    label: 'Attivo',      color: Colors.successColor },
  { value: 'expiring',  label: 'In scadenza', color: Colors.warningColor },
  { value: 'completed', label: 'Inattivo',    color: Colors.errorColor },
];

interface ProjectFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

export default function ProjectFilterModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
}: ProjectFilterModalProps) {
  const handleToggleStatus = useCallback(
    (value: ProjectStatusFilter) => {
      const next = filters.selectedStatuses.includes(value)
        ? filters.selectedStatuses.filter((s) => s !== value)
        : [...filters.selectedStatuses, value];
      onFiltersChange({ ...filters, selectedStatuses: next });
    },
    [filters, onFiltersChange]
  );

  const handleClear = useCallback(() => {
    onFiltersChange(EMPTY_PROJECT_FILTERS);
  }, [onFiltersChange]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtri</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>STATO PROGETTO</Text>
              {STATUS_OPTIONS.map(({ value, label, color }) => {
                const isSelected = filters.selectedStatuses.includes(value);
                return (
                  <Pressable
                    key={value}
                    style={styles.checkboxRow}
                    onPress={() => handleToggleStatus(value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && { backgroundColor: color, borderColor: color },
                      ]}
                    >
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={styles.checkboxLabel}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Cancella filtri</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Applica</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surfaceColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundColor,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.mainTextColor,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.mainTextColor,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textColor,
    opacity: 0.7,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.backgroundColor,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.surfaceColor,
    fontSize: 14,
    fontWeight: '700',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: Colors.mainTextColor,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundColor,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mainTextColor,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surfaceColor,
  },
});
