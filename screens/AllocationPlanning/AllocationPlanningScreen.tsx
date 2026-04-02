import { View, Text, StyleSheet, FlatList, Pressable, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 10;
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllocations,
  selectAllocationsWithUiAndFilters,
  selectAllocationsStatus,
  selectAllocationsError,
  deleteAllocationThunk as deleteAllocationAction,
  type Allocation,
  type AllocationListItem,
} from '../../store/slices/allocationSlice';
import { selectActiveFilterCount } from '../../store/slices/filterSlice';
import AllocationCard from '../../components/AllocationCard';
import FilterModal from '../../components/FilterModal';
import Colors from '../../constants/colors';

const ItemSeparator = memo(function ItemSeparator() {
  return <View style={styles.itemSeparator} />;
});

interface AllocationListProps {
  items: AllocationListItem[];
  hasMore: boolean;
  onLoadMore: () => void;
  onPressDetail: (allocation: Allocation) => void;
  onPressOptions: (allocation: Allocation) => void;
}

const LoadMoreFooter = memo(function LoadMoreFooter({ onLoadMore }: { onLoadMore: () => void }) {
  return (
    <Pressable style={styles.loadMoreButton} onPress={onLoadMore}>
      <Text style={styles.loadMoreText}>Carica altri</Text>
    </Pressable>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>Nessuna Allocation</Text>
      <Text style={styles.emptyStateSubtitle}>
        Crea la tua prima allocation premendo il bottone + in basso a destra
      </Text>
    </View>
  );
});

const AllocationList = memo(function AllocationList({
  items,
  hasMore,
  onLoadMore,
  onPressDetail,
  onPressOptions,
}: AllocationListProps) {
  const renderItem = useCallback(({ item }: { item: AllocationListItem }) => {
    return (
      <AllocationCard
        title={item.employeeFullName}
        projectName={item.projectName}
        dateStart={item.fromDate}
        dateEnd={item.toDate}
        percentage={item.percentage}
        salesRate={item.salesRate}
        isFixedPrice={item.isFixedPrice}
        color={item.cardColor}
        onPressDetail={() => onPressDetail(item)}
        onPressOptions={() => onPressOptions(item)}
      />
    );
  }, [onPressDetail, onPressOptions]);

  const keyExtractor = useCallback((item: AllocationListItem) => item.id.toString(), []);

  const footerComponent = useMemo(
    () => (hasMore ? <LoadMoreFooter onLoadMore={onLoadMore} /> : null),
    [hasMore, onLoadMore]
  );

  // Empty state when no items
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
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
      scrollEventThrottle={16}
      onEndReachedThreshold={0.5}
    />
  );
});

export default memo(function AllocationPlanningScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const allItems = useAppSelector(selectAllocationsWithUiAndFilters);
  const status = useAppSelector(selectAllocationsStatus);
  const error = useAppSelector(selectAllocationsError);
  const activeFilterCount = useAppSelector(selectActiveFilterCount);

  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Icona calendario in header
useLayoutEffect(() => {
navigation.setOptions({
headerRight: () => (
<Pressable
onPress={() => {
const routeNames: string[] = navigation?.getState?.()?.routeNames ?? [];
if (routeNames.includes('Calendar')) {
navigation.navigate('Calendar');
} else {
navigation.navigate('AllocationStack', { screen: 'Calendar' });
}
}}
style={styles.headerCalendarBtn}
android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 20, borderless: true }}
>
<Ionicons name="calendar-outline" size={22} color={Colors.mainTextColor} />
</Pressable>
),
});
}, [navigation]);

  const items = useMemo(() => allItems.slice(0, visibleCount), [allItems, visibleCount]);
  const hasMore = visibleCount < allItems.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  useEffect(() => {
    dispatch(fetchAllocations());
  }, [dispatch]);

  // Reset paginazione quando i dati vengono ricaricati
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [allItems.length]);

  const handlePressOptions = useCallback((allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setOptionsModalVisible(true);
  }, []);

  const handlePressDetail = useCallback((allocation: Allocation) => {
    navigation.navigate('AllocationDetail', { allocationId: allocation.id });
  }, [navigation]);

  const handlePressAddAllocation = useCallback(() => {
    const currentRouteNames: string[] = navigation?.getState?.()?.routeNames ?? [];

    if (currentRouteNames.includes('AddAllocation')) {
      navigation.navigate('AddAllocation');
      return;
    }

    navigation.navigate('AllocationStack', { screen: 'AddAllocation' });
  }, [navigation]);

  const handlePressEditAllocation = useCallback(() => {
    setOptionsModalVisible(false);
    if (!selectedAllocation) {
      return;
    }
    const currentRouteNames: string[] = navigation?.getState?.()?.routeNames ?? [];

    if (currentRouteNames.includes('EditAllocation')) {
      navigation.navigate('EditAllocation', { allocationId: selectedAllocation.id });
      return;
    }

    navigation.navigate('AllocationStack', {
      screen: 'EditAllocation',
      params: { allocationId: selectedAllocation.id }
    });
  }, [navigation, selectedAllocation]);


  /**
   * Handle delete con conferma + loading state
   */
  const handleDeleteAllocation = useCallback(() => {
    if (!selectedAllocation) return;

    Alert.alert(
      'Conferma Eliminazione',
      `Vuoi veramente eliminare l'allocation di ${selectedAllocation.employee?.name}?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            const result = await dispatch(deleteAllocationAction(selectedAllocation.id));
            setDeleteLoading(false);

            if (deleteAllocationAction.fulfilled.match(result)) {
              setOptionsModalVisible(false);
              setSelectedAllocation(null);
            } else {
              Alert.alert('Errore', 'Eliminazione fallita. Riprova.');
            }
          },
        },
      ]
    );
  }, [selectedAllocation, dispatch]);

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Errore: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ACTION BAR */}
      <View style={styles.filterBar}>
        {/* FAB + */}
      <Pressable
        style={styles.filterButton}
        onPress={handlePressAddAllocation}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
      </View>

      <AllocationList
        items={items}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onPressDetail={handlePressDetail}
        onPressOptions={handlePressOptions}
      />

      {/* FAB + */}
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

      {/* Modal edit/delete */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedAllocation?.employee?.name} {selectedAllocation?.employee?.surname}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedAllocation?.project?.name}
            </Text>

            <Pressable
              style={styles.modalOption}
              onPress={handlePressEditAllocation}
              disabled={deleteLoading}
            >
              <Text style={styles.modalOptionText}>Modifica</Text>
            </Pressable>

            <Pressable
              style={[styles.modalOption, styles.modalDelete]}
              onPress={handleDeleteAllocation}
              disabled={deleteLoading}
            >
              <Text style={[styles.modalOptionText, styles.modalDeleteText]}>
                {deleteLoading ? 'Eliminando...' : 'Elimina'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* FILTER MODAL */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />

    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  itemSeparator: {
    height: 20,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.mainTextColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
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
  modalOverlay: {
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
    marginBottom: 12,
    fontWeight: '500',
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
  headerCalendarBtn: {
    paddingRight: 16,
  },
});
