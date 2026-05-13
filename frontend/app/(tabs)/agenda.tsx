import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteSchedule, listSchedules, Schedule } from '../../src/db';
import { formatBRL, formatDateShort, formatTimeShort } from '../../src/format';
import {
  FILTER_OPTIONS,
  SORT_LABELS,
  Status,
  SortOption,
  statusColor,
} from '../../src/status';
import { useTheme } from '../../src/theme';

// In-memory sort preference (persists while app is open per requirements)
let sortMemory: SortOption = 'horario';

export default function AgendaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Todos' | Status>('Todos');
  const [sortBy, setSortBy] = useState<SortOption>(sortMemory);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listSchedules();
    setSchedules(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = schedules;

    if (q) arr = arr.filter((s) => s.carName.toLowerCase().includes(q));
    if (filter !== 'Todos') arr = arr.filter((s) => s.status === filter);

    const sorted = [...arr];
    if (sortBy === 'horario') {
      sorted.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    } else if (sortBy === 'nome') {
      sorted.sort((a, b) =>
        a.carName.localeCompare(b.carName, 'pt-BR', { sensitivity: 'base' })
      );
    } else if (sortBy === 'valor') {
      sorted.sort((a, b) => (b.valor || 0) - (a.valor || 0));
    }
    return sorted;
  }, [schedules, search, filter, sortBy]);

  const setSort = (s: SortOption) => {
    sortMemory = s;
    setSortBy(s);
    setSortMenuOpen(false);
  };

  const handleDelete = useCallback(
    (item: Schedule) => {
      const confirmAndDelete = async () => {
        await deleteSchedule(item.id);
        await load();
      };
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        if (window.confirm('Deseja realmente excluir este agendamento?')) {
          confirmAndDelete();
        }
        return;
      }
      Alert.alert(
        'Excluir agendamento',
        'Deseja realmente excluir este agendamento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: confirmAndDelete },
        ],
        { cancelable: true }
      );
    },
    [load]
  );

  const renderItem = ({ item }: { item: Schedule }) => (
    <TouchableOpacity
      testID={`schedule-item-${item.id}`}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/schedule', params: { id: String(item.id) } })}
      style={[
        styles.card,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
      ]}
    >
      <View style={[styles.timeBlock, { backgroundColor: theme.primary + '15' }]}>
        <Text style={[styles.timeText, { color: theme.primary }]}>
          {formatTimeShort(item.pickupTime)}
        </Text>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {formatDateShort(item.pickupTime).slice(0, 5)}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text
          style={[styles.carName, { color: theme.textPrimary }]}
          numberOfLines={1}
          testID={`schedule-car-name-${item.id}`}
        >
          {item.carName}
        </Text>
        <Text style={[styles.carModel, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.carModel}
        </Text>
        <View style={styles.metaRow}>
          <View
            testID={`status-badge-${item.id}`}
            style={[styles.badge, { backgroundColor: statusColor(item.status) + '22' }]}
          >
            <View
              style={[styles.badgeDot, { backgroundColor: statusColor(item.status) }]}
            />
            <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <Text style={[styles.valor, { color: theme.positive }]}>
            {formatBRL(item.valor)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        testID={`schedule-delete-btn-${item.id}`}
        onPress={(e) => {
          e.stopPropagation?.();
          handleDelete(item);
        }}
        style={[styles.deleteBtn, { backgroundColor: theme.danger + '15' }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={theme.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Agenda</Text>
        <View style={[styles.counterPill, { backgroundColor: theme.primary }]}>
          <Text style={styles.counterText} testID="schedule-counter">
            {schedules.length}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          testID="search-input"
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nome do carro..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.textPrimary }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            testID="search-clear-btn"
            onPress={() => setSearch('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controlsRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(it) => it}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => {
            const active = filter === item;
            return (
              <TouchableOpacity
                testID={`filter-${item.replace(/\s+/g, '-').toLowerCase()}`}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? theme.primary : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? theme.textOnPrimary : theme.textPrimary },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.sortRow}>
        <TouchableOpacity
          testID="sort-button"
          onPress={() => setSortMenuOpen(true)}
          style={[
            styles.sortBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={16} color={theme.primary} />
          <Text style={[styles.sortBtnText, { color: theme.textPrimary }]}>
            Ordenar: {SORT_LABELS[sortBy]}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        testID="schedule-list"
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={
          filtered.length === 0
            ? styles.listEmptyContent
            : { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 }
        }
        ListEmptyComponent={
          <View testID="agenda-empty" style={styles.empty}>
            <Ionicons name="search" size={42} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {search || filter !== 'Todos' ? 'Nenhum resultado' : 'Nenhum agendamento'}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {search || filter !== 'Todos'
                ? 'Ajuste os filtros ou a busca.'
                : 'Toque em + para criar o primeiro.'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />

      <TouchableOpacity
        testID="fab-add-schedule"
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/schedule')}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={sortMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortMenuOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSortMenuOpen(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Ordenar por
            </Text>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                testID={`sort-option-${opt}`}
                style={styles.modalOption}
                onPress={() => setSort(opt)}
              >
                <Text style={[styles.modalOptionText, { color: theme.textPrimary }]}>
                  {SORT_LABELS[opt]}
                </Text>
                {sortBy === opt ? (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: 0.3 },
  counterPill: {
    minWidth: 36,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  controlsRow: { marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: { fontSize: 13, fontWeight: '700' },
  sortRow: { paddingHorizontal: 20, marginBottom: 8 },
  sortBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortBtnText: { fontSize: 13, fontWeight: '700' },
  listEmptyContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginTop: 14 },
  emptyText: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
  },
  timeBlock: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeText: { fontSize: 15, fontWeight: '900' },
  dateText: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  cardBody: { flex: 1 },
  carName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  carModel: { fontSize: 12, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  valor: { fontSize: 13, fontWeight: '800' },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 6px 16px rgba(13,71,161,0.4)' as any }
      : {
          shadowColor: '#0D47A1',
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    padding: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  modalOptionText: { fontSize: 15, fontWeight: '600' },
});
