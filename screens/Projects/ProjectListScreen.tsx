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
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchProjects,
  deleteProjectThunk,
  selectProjects,
  selectProjectsStatus,
  selectProjectsError,
  selectProjectsHasBeenFetched,
  type Project,
} from '../../store/slices/projectSlice';
import ProjectCard from '../../components/ProjectCard';
import ProjectFilterModal, {
  type ProjectFilters,
  EMPTY_PROJECT_FILTERS,
  countProjectFilters,
} from '../../components/ProjectFilterModal';
import { getProjectStatus } from '../../utils/projectColors';
import Colors from '../../constants/colors';

const PAGE_SIZE = 10;

// ─── Sub-componenti ───────────────────────────────────────────────────────────

const ItemSeparator = memo(function ItemSeparator() {
  return <View style={styles.itemSeparator} />;
});

const EmptyState = memo(function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📁</Text>
      <Text style={styles.emptyTitle}>Nessun Progetto</Text>
      <Text style={styles.emptySubtitle}>
        Aggiungi il primo progetto premendo il bottone + in alto
      </Text>
    </View>
  );
});

const LoadMoreFooter = memo(function LoadMoreFooter({
  onLoadMore,
}: {
  onLoadMore: () => void;
}) {
  return (
    <Pressable style={styles.loadMoreButton} onPress={onLoadMore}>
      <Text style={styles.loadMoreText}>Carica altri</Text>
    </Pressable>
  );
});

// ─── Schermata principale ─────────────────────────────────────────────────────

export default memo(function ProjectListScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const status = useAppSelector(selectProjectsStatus);
  const error = useAppSelector(selectProjectsError);
  const hasBeenFetched = useAppSelector(selectProjectsHasBeenFetched);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [projectFilters, setProjectFilters] = useState<ProjectFilters>(EMPTY_PROJECT_FILTERS);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const activeFilterCount = countProjectFilters(projectFilters);

  const filteredProjects = useMemo(() => {
    if (projectFilters.selectedStatuses.length === 0) return projects;
    return projects.filter((p) =>
      projectFilters.selectedStatuses.includes(getProjectStatus(p.isActive, p.toDate))
    );
  }, [projects, projectFilters]);

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
    if (!hasBeenFetched) dispatch(fetchProjects());
  }, [dispatch, hasBeenFetched]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredProjects.length]);

  const visibleProjects = useMemo(
    () => filteredProjects.slice(0, visibleCount),
    [filteredProjects, visibleCount]
  );
  const hasMore = visibleCount < filteredProjects.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const handlePressOptions = useCallback((project: Project) => {
    setSelectedProject(project);
    setOptionsModalVisible(true);
  }, []);

  const handlePressDetail = useCallback(
    (project: Project) => {
      navigation.navigate('ProjectDetail', { projectId: project.id });
    },
    [navigation]
  );

  const handlePressAdd = useCallback(() => {
    const routeNames: string[] = navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('AddProject')) {
      navigation.navigate('AddProject');
    } else {
      navigation.navigate('ProjectStack', { screen: 'AddProject' });
    }
  }, [navigation]);

  const handlePressEdit = useCallback(() => {
    setOptionsModalVisible(false);
    if (!selectedProject) return;
    const routeNames: string[] = navigation?.getState?.()?.routeNames ?? [];
    if (routeNames.includes('EditProject')) {
      navigation.navigate('EditProject', { projectId: selectedProject.id });
    } else {
      navigation.navigate('ProjectStack', {
        screen: 'EditProject',
        params: { projectId: selectedProject.id },
      });
    }
  }, [navigation, selectedProject]);

  const handleDelete = useCallback(() => {
    if (!selectedProject) return;
    Alert.alert(
      'Conferma Eliminazione',
      `Vuoi veramente eliminare il progetto "${selectedProject.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            const result = await dispatch(deleteProjectThunk(selectedProject.id));
            setDeleteLoading(false);
            if (deleteProjectThunk.fulfilled.match(result)) {
              setOptionsModalVisible(false);
              setSelectedProject(null);
            } else {
              Alert.alert('Errore', 'Eliminazione fallita. Riprova.');
            }
          },
        },
      ]
    );
  }, [selectedProject, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        name={item.name}
        description={item.description}
        type={item.type}
        fromDate={item.fromDate}
        toDate={item.toDate}
        isActive={item.isActive}
        onPressDetail={() => handlePressDetail(item)}
        onPressOptions={() => handlePressOptions(item)}
      />
    ),
    [handlePressDetail, handlePressOptions]
  );

  const keyExtractor = useCallback((item: Project) => item.id.toString(), []);

  const footerComponent = useMemo(
    () => (hasMore ? <LoadMoreFooter onLoadMore={handleLoadMore} /> : null),
    [hasMore, handleLoadMore]
  );

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

      {/* ── Lista ── */}
      {filteredProjects.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={visibleProjects}
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
        />
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
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedProject?.name}
            </Text>

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

      {/* ── Filter Modal ── */}
      <ProjectFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={projectFilters}
        onFiltersChange={setProjectFilters}
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
  headerButton: { marginRight: 8 },
  // ── Action bar ──
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
  fabText: {
    fontSize: 28,
    color: Colors.mainTextColor,
    fontWeight: '400',
    lineHeight: 32,
  },
  // ── List ──
  listContent: {
    paddingBottom: 100,
  },
  itemSeparator: {
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
