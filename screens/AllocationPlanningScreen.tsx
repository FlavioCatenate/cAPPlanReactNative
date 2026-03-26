import { View, Text, StyleSheet, FlatList, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAllocations,
  selectAllocations,
  selectAllocationsStatus,
  selectAllocationsError,
  type Allocation,
} from '../store/slices/allocationSlice';
import { getAllocationStatus, getStatusColor } from '../utils/allocationColors';
import AllocationCard from '../components/AllocationCard';
import Colors from '../constants/colors';

export default function AllocationPlanningScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllocations);
  const status = useAppSelector(selectAllocationsStatus);
  const error = useAppSelector(selectAllocationsError);

  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchAllocations());
  }, [dispatch]);

  const handlePressOptions = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setModalVisible(true);
  };

  const handlePressDetail = (allocation: Allocation) => {
    navigation.navigate('AllocationDetail', { allocation });
  };

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

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const allocationStatus = getAllocationStatus(item);
          const cardColor = getStatusColor(allocationStatus);
          return (
            <AllocationCard
              title={`${item.employee.name} ${item.employee.surname}`}
              projectName={item.project.name}
              dateStart={item.fromDate}
              dateEnd={item.toDate}
              percentage={item.percentage}
              color={cardColor}
              onPressDetail={() => handlePressDetail(item)}
              onPressOptions={() => handlePressOptions(item)}
            />
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB + */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddAllocation')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Modal edit/delete — da espandere */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedAllocation?.employee.name} {selectedAllocation?.employee.surname}
            </Text>
            <Pressable style={styles.modalOption} onPress={() => {
              setModalVisible(false);
              navigation.navigate('EditAllocation', { allocation: selectedAllocation });
            }}>
              <Text style={styles.modalOptionText}>Modifica</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, styles.modalDelete]} onPress={() => {
              setModalVisible(false);
              // TODO: dispatch(deleteAllocation(selectedAllocation!.id))
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
    backgroundColor: Colors.primary,
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
    color: '#fff',
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