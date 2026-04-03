import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
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
  fetchSkills,
  deleteSkillThunk,
  selectSkills,
  selectSkillsStatus,
  selectSkillsError,
  selectSkillsHasBeenFetched,
  type Skill,
} from '../../store/slices/skillSlice';
import Colors from '../../constants/colors';

// ─── Sub-componenti ───────────────────────────────────────────────────────────

const EmptyState = memo(function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛠️</Text>
      <Text style={styles.emptyTitle}>Nessuna Skill</Text>
      <Text style={styles.emptySubtitle}>
        Aggiungi la prima skill premendo il bottone + in alto
      </Text>
    </View>
  );
});

interface SkillChipProps {
  skill: Skill;
  onPress: () => void;
  onLongPress: () => void;
}

const SkillChip = memo(function SkillChip({ skill, onPress, onLongPress }: SkillChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {skill.name}
      </Text>
    </Pressable>
  );
});

// ─── Schermata principale ─────────────────────────────────────────────────────

export default memo(function SkillListScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const skills = useAppSelector(selectSkills);
  const status = useAppSelector(selectSkillsStatus);
  const error = useAppSelector(selectSkillsError);
  const hasBeenFetched = useAppSelector(selectSkillsHasBeenFetched);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Calendar')}
          style={styles.headerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="calendar-outline" size={22} color={Colors.mainTextColor} />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!hasBeenFetched) dispatch(fetchSkills());
  }, [dispatch, hasBeenFetched]);

  const handlePressOptions = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    setOptionsModalVisible(true);
  }, []);

  const handlePressDetail = useCallback(
    (skill: Skill) => {
      navigation.navigate('SkillDetail', { skillId: skill.id });
    },
    [navigation]
  );

  const handlePressAdd = useCallback(() => {
    const routeNames: string[] = navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('AddSkill')) {
      navigation.navigate('AddSkill');
    } else {
      navigation.navigate('SkillStack', { screen: 'AddSkill' });
    }
  }, [navigation]);

  const handlePressEdit = useCallback(() => {
    setOptionsModalVisible(false);
    if (!selectedSkill) return;
    const routeNames: string[] = navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('EditSkill')) {
      navigation.navigate('EditSkill', { skillId: selectedSkill.id });
    } else {
      navigation.navigate('SkillStack', {
        screen: 'EditSkill',
        params: { skillId: selectedSkill.id },
      });
    }
  }, [navigation, selectedSkill]);

  const handleDelete = useCallback(() => {
    if (!selectedSkill) return;
    Alert.alert(
      'Conferma Eliminazione',
      `Vuoi veramente eliminare la skill "${selectedSkill.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            const result = await dispatch(deleteSkillThunk(selectedSkill.id));
            setDeleteLoading(false);
            if (deleteSkillThunk.fulfilled.match(result)) {
              setOptionsModalVisible(false);
              setSelectedSkill(null);
            } else {
              Alert.alert('Errore', 'Eliminazione fallita. Riprova.');
            }
          },
        },
      ]
    );
  }, [selectedSkill, dispatch]);

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
        <Text style={styles.errorText}>Errore: {error}</Text>
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

      {/* ── Chips ── */}
      {skills.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.chipsRow}>
            {skills.map((skill) => (
              <SkillChip
                key={skill.id}
                skill={skill}
                onPress={() => handlePressDetail(skill)}
                onLongPress={() => handlePressOptions(skill)}
              />
            ))}
          </View>
        </ScrollView>
      )}

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
            <Text style={styles.modalTitle}>{selectedSkill?.name}</Text>

            <Pressable
              style={styles.modalOption}
              onPress={handlePressEdit}
              disabled={deleteLoading}
            >
              <Text style={styles.modalOptionText}>Modifica</Text>
            </Pressable>

            <Pressable
              style={[styles.modalOption, styles.modalDelete]}
              onPress={handleDelete}
              disabled={deleteLoading}
            >
              <Text style={[styles.modalOptionText, styles.modalDeleteText]}>
                {deleteLoading ? 'Eliminando...' : 'Elimina'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  headerButton: { marginRight: 8 },
  // ── Action bar ──
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  fabText: {
    fontSize: 28,
    color: Colors.mainTextColor,
    fontWeight: '400',
    lineHeight: 32,
  },
  // ── Scroll / chips ──
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textColor,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // ── Chip ──
  chip: {
    backgroundColor: Colors.surfaceColor,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.secondaryGray + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  chipPressed: {
    opacity: 0.7,
    backgroundColor: Colors.backgroundColor,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mainTextColor,
  },
  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
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
  errorText: { color: Colors.errorColor, fontSize: 16, fontWeight: '500' },
  // ── Modal ──
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
  modalDelete: { backgroundColor: Colors.errorColor + '18' },
  modalDeleteText: { color: Colors.errorColor },
});