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
import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchEmployeeTeams,
  selectAllTeamNames,
  selectEmployeeTeamStatus,
  selectEmployeeTeamItems,
  selectEmployeeRoleMap,
} from '../store/slices/employeeTeamSlice';
import {
  fetchEmployees,
  selectEmployees,
  selectEmployeesStatus,
} from '../store/slices/employeeSlice';
import Colors from '../constants/colors';

export interface EmployeeFilters {
  selectedTutorId: number | null;
  selectedLeaderId: number | null;
  selectedTeams: string[];
  isFreelancer: boolean | null;
}

export const EMPTY_EMPLOYEE_FILTERS: EmployeeFilters = {
  selectedTutorId: null,
  selectedLeaderId: null,
  selectedTeams: [],
  isFreelancer: null,
};

export function countEmployeeFilters(filters: EmployeeFilters): number {
  return (
    (filters.selectedTutorId !== null ? 1 : 0) +
    (filters.selectedLeaderId !== null ? 1 : 0) +
    filters.selectedTeams.length +
    (filters.isFreelancer !== null ? 1 : 0)
  );
}

interface EmployeeFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
}

export default function EmployeeFilterModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
}: EmployeeFilterModalProps) {
  const dispatch = useAppDispatch();
  const teamNames = useAppSelector(selectAllTeamNames);
  const teamStatus = useAppSelector(selectEmployeeTeamStatus);
  const employeeTeamItems = useAppSelector(selectEmployeeTeamItems);
  const employeeRoleMap = useAppSelector(selectEmployeeRoleMap);
  const employees = useAppSelector(selectEmployees);
  const employeeStatus = useAppSelector(selectEmployeesStatus);

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

  // Employees who are tutors / leaders
  const tutorEmployees = useMemo(
    () => employees.filter((e) => employeeRoleMap.get(e.id)?.isTutor),
    [employees, employeeRoleMap]
  );
  const leaderEmployees = useMemo(
    () => employees.filter((e) => employeeRoleMap.get(e.id)?.isLeader),
    [employees, employeeRoleMap]
  );

  const handleSelectTutor = useCallback(
    (id: number) => {
      onFiltersChange({
        ...filters,
        selectedTutorId: filters.selectedTutorId === id ? null : id,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSelectLeader = useCallback(
    (id: number) => {
      onFiltersChange({
        ...filters,
        selectedLeaderId: filters.selectedLeaderId === id ? null : id,
      });
    },
    [filters, onFiltersChange]
  );

  const handleToggleTeam = useCallback(
    (teamName: string) => {
      const next = filters.selectedTeams.includes(teamName)
        ? filters.selectedTeams.filter((t) => t !== teamName)
        : [...filters.selectedTeams, teamName];
      onFiltersChange({ ...filters, selectedTeams: next });
    },
    [filters, onFiltersChange]
  );

  const handleSetFreelancer = useCallback(
    (value: boolean) => {
      onFiltersChange({
        ...filters,
        isFreelancer: filters.isFreelancer === value ? null : value,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClear = useCallback(() => {
    onFiltersChange(EMPTY_EMPLOYEE_FILTERS);
  }, [onFiltersChange]);

  const isLoadingPeople =
    (teamStatus === 'loading' && employeeTeamItems.length === 0) ||
    (employeeStatus === 'loading' && employees.length === 0);

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
            {/* TUTOR */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TUTOR</Text>
              {isLoadingPeople ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Caricamento...</Text>
                </View>
              ) : tutorEmployees.length === 0 ? (
                <Text style={styles.emptyText}>Nessun tutor disponibile</Text>
              ) : (
                tutorEmployees.map((e) => {
                  const isSelected = filters.selectedTutorId === e.id;
                  return (
                    <Pressable
                      key={e.id}
                      style={styles.checkboxRow}
                      onPress={() => handleSelectTutor(e.id)}
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
                        {e.surname} {e.name}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* LEADER */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LEADER</Text>
              {isLoadingPeople ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Caricamento...</Text>
                </View>
              ) : leaderEmployees.length === 0 ? (
                <Text style={styles.emptyText}>Nessun leader disponibile</Text>
              ) : (
                leaderEmployees.map((e) => {
                  const isSelected = filters.selectedLeaderId === e.id;
                  return (
                    <Pressable
                      key={e.id}
                      style={styles.checkboxRow}
                      onPress={() => handleSelectLeader(e.id)}
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
                        {e.surname} {e.name}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* TEAM */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TEAM</Text>
              {teamStatus === 'loading' && teamNames.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Caricamento team...</Text>
                </View>
              ) : teamNames.length === 0 ? (
                <Text style={styles.emptyText}>Nessun team disponibile</Text>
              ) : (
                teamNames.map((teamName) => {
                  const isSelected = filters.selectedTeams.includes(teamName);
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
                      <Text style={styles.checkboxLabel}>{teamName}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* FREELANCER */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FREELANCER</Text>
              <Pressable
                style={styles.checkboxRow}
                onPress={() => handleSetFreelancer(true)}
              >
                <View
                  style={[
                    styles.checkbox,
                    filters.isFreelancer === true && styles.checkboxSelected,
                  ]}
                >
                  {filters.isFreelancer === true && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Yes</Text>
              </Pressable>
              <Pressable
                style={styles.checkboxRow}
                onPress={() => handleSetFreelancer(false)}
              >
                <View
                  style={[
                    styles.checkbox,
                    filters.isFreelancer === false && styles.checkboxSelected,
                  ]}
                >
                  {filters.isFreelancer === false && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>No</Text>
              </Pressable>
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textColor,
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
