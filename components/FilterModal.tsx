import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchEmployeeTeams,
  selectAllTeamNames,
  selectEmployeeTeamStatus,
} from '../store/slices/employeeTeamSlice';
import {
  fetchEmployees,
  selectEmployees,
  selectEmployeesStatus,
} from '../store/slices/employeeSlice';
import {
  selectSelectedTeams,
  selectSelectedStatuses,
  selectSelectedEmployees,
  toggleTeamFilter,
  toggleStatusFilter,
  toggleEmployeeFilter,
  clearAllFilters,
} from '../store/slices/filterSlice';
import Colors from '../constants/colors';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

// Status colors per i badge
const STATUS_OPTIONS = [
  { label: 'Attivo', color: Colors.successColor },
  { label: 'In scadenza', color: Colors.warningColor },
  { label: 'Completato', color: Colors.errorColor },
];

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const dispatch = useAppDispatch();

  const teamNames = useAppSelector(selectAllTeamNames);
  const teamStatus = useAppSelector(selectEmployeeTeamStatus);
  const employees = useAppSelector(selectEmployees);
  const employeeStatus = useAppSelector(selectEmployeesStatus);

  const selectedTeams = useAppSelector(selectSelectedTeams);
  const selectedStatuses = useAppSelector(selectSelectedStatuses);
  const selectedEmployees = useAppSelector(selectSelectedEmployees);

  // Lazy load team data quando il modal viene aperto
  useEffect(() => {
    if (visible && teamNames.length === 0 && teamStatus === 'idle') {
      dispatch(fetchEmployeeTeams());
    }
  }, [visible, dispatch, teamNames.length, teamStatus]);

  useEffect(() => {
    if (visible && employees.length === 0 && employeeStatus === 'idle') {
      dispatch(fetchEmployees());
    }
  }, [visible, dispatch, employees.length, employeeStatus]);

  const handleToggleTeam = useCallback(
    (teamName: string) => {
      dispatch(toggleTeamFilter(teamName));
    },
    [dispatch]
  );

  const handleToggleStatus = useCallback(
    (statusValue: string) => {
      dispatch(toggleStatusFilter(statusValue));
    },
    [dispatch]
  );

  const handleToggleEmployee = useCallback(
    (employeeId: number) => {
      dispatch(toggleEmployeeFilter(employeeId));
    },
    [dispatch]
  );

  const handleClearFilters = useCallback(() => {
    dispatch(clearAllFilters());
  }, [dispatch]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
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
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* TEAM SECTION */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TEAM</Text>

              {teamStatus === 'loading' ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={Colors.primary}
                  />
                  <Text style={styles.loadingText}>
                    Caricamento team...
                  </Text>
                </View>
              ) : teamStatus === 'failed' ? (
                <Text style={styles.errorText}>
                  Errore caricamento team
                </Text>
              ) : teamNames.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nessun team disponibile
                </Text>
              ) : (
                teamNames.map((teamName) => {
                  const isSelected = selectedTeams.includes(teamName);
                  return (
                    <Pressable
                      key={teamName}
                      style={styles.checkboxRow}
                      onPress={() => handleToggleTeam(teamName)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        {teamName}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* STATUS SECTION */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>STATO ALLOCAZIONE</Text>

              {STATUS_OPTIONS.map((status) => {
                const isSelected = selectedStatuses.includes(status.color);
                return (
                  <Pressable
                    key={status.color}
                    style={styles.checkboxRow}
                    onPress={() => handleToggleStatus(status.color)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <View style={styles.statusLabelContainer}>
                      <View
                        style={[
                          styles.statusColorDot,
                          { backgroundColor: status.color },
                        ]}
                      />
                      <Text style={styles.checkboxLabel}>
                        {status.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EMPLOYEE</Text>

              {employeeStatus === 'loading' ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={Colors.primary}
                  />
                  <Text style={styles.loadingText}>
                    Caricamento employee...
                  </Text>
                </View>
              ) : employeeStatus === 'failed' ? (
                <Text style={styles.errorText}>
                  Errore caricamento employee
                </Text>
              ) : employees.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nessun employee disponibile
                </Text>
              ) : (
                employees.map((employee) => {
                  const isSelected = selectedEmployees.includes(employee.id);
                  const employeeFullName = [employee.name, employee.surname]
                    .filter(Boolean)
                    .join(' ')
                    .trim();

                  return (
                    <Pressable
                      key={employee.id}
                      style={styles.checkboxRow}
                      onPress={() => handleToggleEmployee(employee.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        {employeeFullName || `Employee #${employee.id}`}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>
                Cancella filtri
              </Text>
            </Pressable>
            <Pressable
              style={styles.applyButton}
              onPress={onClose}
            >
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // safe area iOS
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
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.surfaceColor,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: Colors.mainTextColor,
    fontWeight: '500',
    flex: 1,
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textColor,
  },
  errorText: {
    fontSize: 14,
    color: Colors.errorColor,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textColor,
    fontStyle: 'italic',
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
    color: '#fff',
  },
});
