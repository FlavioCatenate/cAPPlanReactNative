import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchEmployees,
  deleteEmployeeThunk,
  selectEmployeesStatus,
  selectEmployeesError,
  selectEmployeesHasBeenFetched,
  selectEmployees,
  type Employee,
} from '../../store/slices/employeeSlice';
import EmployeeCard from '../../components/EmployeeCard';
import EmployeeFilterModal, {
  type EmployeeFilters,
  EMPTY_EMPLOYEE_FILTERS,
  countEmployeeFilters,
} from '../../components/EmployeeFilterModal';
import Colors from '../../constants/colors';
import {
  getEmployeeRoleFromFlags,
  getEmployeeRoleColor,
} from '../../utils/employeeColors';
import {
  fetchEmployeeSkills,
  selectEmployeeSkillMap,
  selectEmployeeSkillHasBeenFetched,
} from '../../store/slices/employeeSkillSlice';
import {
  fetchEmployeeTeams,
  selectEmployeeTeamItems,
  selectEmployeeTeamMap,
  selectAllTeamNames,
  selectEmployeeTeamHasBeenFetched,
  selectEmployeeRoleMap,
} from '../../store/slices/employeeTeamSlice';

const PAGE_SIZE = 20;

// ─── Sub-componenti ──────────────────────────────────────────────────────

const ItemSeparator = memo(function ItemSeparator() {
  return <View style={styles.separator} />;
});

const EmptyState = memo(function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>Nessun Employee</Text>
      <Text style={styles.emptySubtitle}>
        Aggiungi il primo employee premendo il bottone + in basso a destra
      </Text>
    </View>
  );
});

// ─── Schermata principale ─────────────────────────────────────────────────────

export default memo(function EmployeeListScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectEmployeesStatus);
  const error = useAppSelector(selectEmployeesError);
  const hasBeenFetched = useAppSelector(selectEmployeesHasBeenFetched);
  const allEmployees = useAppSelector(selectEmployees);
  const employeeTeamMap = useAppSelector(selectEmployeeTeamMap);
  const employeeTeamItems = useAppSelector(selectEmployeeTeamItems);
  const employeeRoleMap = useAppSelector(selectEmployeeRoleMap);
  const allTeamNames = useAppSelector(selectAllTeamNames);
  const teamsHasBeenFetched = useAppSelector(selectEmployeeTeamHasBeenFetched);
  const employeeSkillMap = useAppSelector(selectEmployeeSkillMap);
  const skillsHasBeenFetched = useAppSelector(selectEmployeeSkillHasBeenFetched);

  // ── Filtri ──
  const [employeeFilters, setEmployeeFilters] = useState<EmployeeFilters>(EMPTY_EMPLOYEE_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const activeFilterCount = countEmployeeFilters(employeeFilters);

  // Tutti i filtri client-side usando le mappe relazione
  const filteredEmployees = useMemo(() => {
    // Precompute teams managed by the selected leader (if any)
    const leaderTeams: Set<string> | null = employeeFilters.selectedLeaderId !== null
      ? new Set(
          employeeTeamItems
            .filter((et) => et.isLeader && et.employee.id === employeeFilters.selectedLeaderId)
            .map((et) => et.team.name)
        )
      : null;

    return allEmployees.filter((e) => {
      if (employeeFilters.selectedTutorId !== null && e.tutorId?.id !== employeeFilters.selectedTutorId) return false;
      if (leaderTeams !== null) {
        const eteams = employeeTeamMap.get(e.id) ?? [];
        if (!eteams.some((t) => leaderTeams.has(t.name))) return false;
      }
      if (employeeFilters.selectedTeams.length > 0) {
        const eteams = employeeTeamMap.get(e.id) ?? [];
        if (!eteams.some((t) => employeeFilters.selectedTeams.includes(t.name))) return false;
      }
      if (employeeFilters.isFreelancer !== null && e.isFreelancer !== employeeFilters.isFreelancer) return false;
      return true;
    });
  }, [allEmployees, employeeFilters, employeeTeamMap, employeeTeamItems]);

  // ── Paginazione client-side ──
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const items = useMemo(
    () => filteredEmployees.slice(0, visibleCount),
    [filteredEmployees, visibleCount]
  );
  const hasMore = visibleCount < filteredEmployees.length;

  // Reset paginazione quando cambiano i filtri
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [employeeFilters, filteredEmployees.length]);

  // ── Stato modal ──
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Header: icona calendario ──
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Calendar')}
          style={styles.headerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={Colors.mainTextColor}
          />
        </Pressable>
      ),
    });
  }, [navigation]);

  // ── Fetch iniziale (solo se non già caricato) ──
  useEffect(() => {
    if (!hasBeenFetched) dispatch(fetchEmployees());
  }, [dispatch, hasBeenFetched]);

  useEffect(() => {
    if (!skillsHasBeenFetched) dispatch(fetchEmployeeSkills());
  }, [dispatch, skillsHasBeenFetched]);

  useEffect(() => {
    if (!teamsHasBeenFetched) dispatch(fetchEmployeeTeams());
  }, [dispatch, teamsHasBeenFetched]);

  // ── Callbacks ──
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const handlePressOptions = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setOptionsModalVisible(true);
  }, []);

  const handlePressDetail = useCallback(
    (employee: Employee) => {
      navigation.navigate('EmployeeDetail', { employeeId: employee.id });
    },
    [navigation]
  );

  const handlePressAdd = useCallback(() => {
    const routeNames: string[] =
      navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('AddEmployee')) {
      navigation.navigate('AddEmployee');
    } else {
      navigation.navigate('EmployeeStack', { screen: 'AddEmployee' });
    }
  }, [navigation]);

  const handlePressEdit = useCallback(() => {
    setOptionsModalVisible(false);
    if (!selectedEmployee) return;
    const routeNames: string[] =
      navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('EditEmployee')) {
      navigation.navigate('EditEmployee', {
        employeeId: selectedEmployee.id,
      });
    } else {
      navigation.navigate('EmployeeStack', {
        screen: 'EditEmployee',
        params: { employeeId: selectedEmployee.id },
      });
    }
  }, [navigation, selectedEmployee]);

  const handlePressDuplicate = useCallback(() => {
    setOptionsModalVisible(false);
    if (!selectedEmployee) return;
    const routeNames: string[] = navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('DuplicateEmployee')) {
      navigation.navigate('DuplicateEmployee', { employeeId: selectedEmployee.id });
    } else {
      navigation.navigate('EmployeeStack', {
        screen: 'DuplicateEmployee',
        params: { employeeId: selectedEmployee.id },
      });
    }
  }, [navigation, selectedEmployee]);

  const handleDelete = useCallback(() => {
    if (!selectedEmployee) return;
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedEmployee.name} ${selectedEmployee.surname}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            const result = await dispatch(
              deleteEmployeeThunk(selectedEmployee.id)
            );
            setDeleteLoading(false);
            if (deleteEmployeeThunk.fulfilled.match(result)) {
              setOptionsModalVisible(false);
              setSelectedEmployee(null);
            } else {
              Alert.alert('Error', 'Deletion failed. Please try again.');
            }
          },
        },
      ]
    );
  }, [selectedEmployee, dispatch]);

  // Mappa dinamica: teamName → nome completo del leader (da employeeTeamItems)
  const teamLeaderMap = useMemo(() => {
    const map = new Map<string, string>();
    employeeTeamItems.forEach((et) => {
      if (et.isLeader && et.employee.name && et.employee.surname) {
        map.set(et.team.name, `${et.employee.name} ${et.employee.surname}`);
      }
    });
    return map;
  }, [employeeTeamItems]);

  // ── Render item ──
  const renderItem = useCallback(
    ({ item }: { item: Employee }) => {
      const flags = employeeRoleMap.get(item.id);
      const role = getEmployeeRoleFromFlags(flags?.isLeader, flags?.isTutor);
      const teamName = employeeTeamMap.get(item.id)?.[0]?.name;
      const isLeader = flags?.isLeader ?? false;
      const tutorFullName = isLeader
        ? undefined
        : item.tutorId
          ? `${item.tutorId.name} ${item.tutorId.surname}`
          : 'N/A';
      const leaderFullName = isLeader
        ? undefined
        : teamName ? (teamLeaderMap.get(teamName) ?? 'N/A') : 'N/A';
      return (
        <EmployeeCard
          fullName={`${item.name} ${item.surname}`}
          email={item.emailAddress}
          team={teamName ?? 'Nessun team'}
          leaderFullName={leaderFullName}
          role={role}
          roleColor={getEmployeeRoleColor(role)}
          skillCount={employeeSkillMap.get(item.id)?.length}
          tutorFullName={tutorFullName}
          onPressDetail={() => handlePressDetail(item)}
          onPressOptions={() => handlePressOptions(item)}
        />
      );
    },
    [
      handlePressDetail,
      handlePressOptions,
      employeeSkillMap,
      employeeTeamMap,
      employeeRoleMap,
      teamLeaderMap,
    ]
  );

  const keyExtractor = useCallback(
    (item: Employee) => item.id.toString(),
    []
  );

  const footerComponent = useMemo(
    () => (hasMore ? <ActivityIndicator style={{ marginVertical: 12 }} color={Colors.primary} /> : null),
    [hasMore]
  );

  // ── Loading / Error ──
  if (status === 'loading' && !hasBeenFetched) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── ACTION BAR ── */}
      <View style={styles.filterBar}>
        <Pressable
          style={styles.filterButton}
          onPress={handlePressAdd}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>

      {/* ── Lista ── */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={footerComponent}
          onEndReached={hasMore ? handleLoadMore : undefined}
          onEndReachedThreshold={0.3}
          scrollEventThrottle={16}
        />
      )}

      {/* ── FAB filtri ── */}
      <Pressable
        style={styles.fab}
        onPress={() => setFilterModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>🏷️</Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </Pressable>

      {/* ── Modal opzioni ── */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedEmployee?.surname} {selectedEmployee?.name}
            </Text>
            {selectedEmployee
              ? (employeeTeamMap.get(selectedEmployee.id)?.[0]?.name ?? null)
                ? <Text style={styles.modalSubtitle}>
                    {employeeTeamMap.get(selectedEmployee.id)!.map((t) => t.name).join(', ')}
                  </Text>
                : null
              : null}

            <Pressable
              style={styles.modalOption}
              onPress={handlePressEdit}
              disabled={deleteLoading}
            >
              <Text style={styles.modalOptionText}>Edit</Text>
            </Pressable>

            <Pressable
              style={styles.modalOption}
              onPress={handlePressDuplicate}
              disabled={deleteLoading}
            >
              <Text style={styles.modalOptionText}>Duplicate</Text>
            </Pressable>

            <Pressable
              style={[styles.modalOption, styles.modalDelete]}
              onPress={handleDelete}
              disabled={deleteLoading}
            >
              <Text style={[styles.modalOptionText, styles.modalDeleteText]}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ── Filter Modal ── */}
      <EmployeeFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={employeeFilters}
        onFiltersChange={setEmployeeFilters}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  headerButton: {
    marginRight: 8,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 20,
    color: Colors.mainTextColor,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.errorColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  loadMoreButton: {
    marginTop: 20,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.surfaceColor,
    alignItems: 'center',
  },
  loadMoreText: {
    color: Colors.mainTextColor,
    fontWeight: '600',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.mainTextColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.textColor,
  },
  errorText: {
    color: Colors.errorColor,
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fabText: {
    fontSize: 28,
    color: Colors.mainTextColor,
    fontWeight: '400',
    lineHeight: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: Colors.surfaceColor,
    borderRadius: 14,
    padding: 20,
    width: '75%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.mainTextColor,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.mainTextColor,
    fontWeight: '500',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor,
  },
  modalOptionText: {
    fontSize: 15,
    color: Colors.mainTextColor,
    fontWeight: '500',
  },
  modalDelete: {
    backgroundColor: Colors.errorColor + '18',
  },
  modalDeleteText: {
    color: Colors.errorColor,
  },
});