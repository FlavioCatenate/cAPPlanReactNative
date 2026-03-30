import { View, Text, StyleSheet, FlatList, Pressable, Modal, ActivityIndicator, Alert } from 'react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllocations,
  selectAllocationsWithUi,
  selectAllocationsStatus,
  selectAllocationsError,
  deleteAllocationThunk as deleteAllocation,
  type Allocation,
  type AllocationListItem,
} from '../../store/slices/allocationSlice';
import AllocationCard from '../../components/AllocationCard';
import Colors from '../../constants/colors';

const ItemSeparator = memo(function ItemSeparator() {
  return <View style={styles.itemSeparator} />;
});

interface AllocationListProps {
  items: AllocationListItem[];
  onPressDetail: (allocation: Allocation) => void;
  onPressOptions: (allocation: Allocation) => void;
}

const AllocationList = memo(function AllocationList({
  items,
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

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={styles.listContent}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      updateCellsBatchingPeriod={75}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
});

export default function AllocationPlanningScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllocationsWithUi);
  const status = useAppSelector(selectAllocationsStatus);
  const error = useAppSelector(selectAllocationsError);

  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchAllocations());
  }, [dispatch]);

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

      <AllocationList
        items={items}
        onPressDetail={handlePressDetail}
        onPressOptions={handlePressOptions}
      />

      {/* FAB + */}
      <Pressable
        style={styles.fab}
        onPress={handlePressAddAllocation}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Modal edit/delete — da espandere */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOptionsModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedAllocation?.employee?.name} {selectedAllocation?.employee?.surname}
            </Text>
            <Pressable style={styles.modalOption} onPress={() => {
              setOptionsModalVisible(false);
              Alert.alert('Non disponibile', 'La schermata di modifica non e ancora configurata.');
            }}>
              <Text style={styles.modalOptionText}>Modifica</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, styles.modalDelete]} onPress={() => {
              setOptionsModalVisible(false);
              if (!selectedAllocation) {
                return;
              }

              dispatch(deleteAllocation(selectedAllocation.id));
            }}>
              <Text style={[styles.modalOptionText, styles.modalDeleteText]}>Elimina</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  itemSeparator: {
    height: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  errorText: {
    color: Colors.errorColor,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#000000',
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
    fontWeight: '600',
    color: Colors.mainTextColor,
    marginBottom: 4,
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
  },
  modalDelete: {
    backgroundColor: Colors.errorColor + '18',
  },
  modalDeleteText: {
    color: Colors.errorColor,
  },
});