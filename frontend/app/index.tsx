import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteSchedule, listSchedules, Schedule } from '../src/db';
import { formatDateShort, formatTimeShort } from '../src/format';

export default function HomeScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSchedules = useCallback(async () => {
    try {
      const data = await listSchedules();
      setSchedules(data);
    } catch (e) {
      console.warn('Erro ao carregar agendamentos', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [loadSchedules])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  }, [loadSchedules]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schedules;
    return schedules.filter((s) => s.carName.toLowerCase().includes(q));
  }, [schedules, search]);

  const handleDelete = useCallback(
    (item: Schedule) => {
      const confirmAndDelete = async () => {
        try {
          await deleteSchedule(item.id);
          await loadSchedules();
        } catch (e) {
          console.warn('Erro ao excluir', e);
        }
      };

      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        const ok = window.confirm('Deseja realmente excluir este agendamento?');
        if (ok) confirmAndDelete();
        return;
      }

      Alert.alert(
        'Excluir agendamento',
        'Deseja realmente excluir este agendamento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: confirmAndDelete,
          },
        ],
        { cancelable: true }
      );
    },
    [loadSchedules]
  );

  const renderItem = ({ item }: { item: Schedule }) => (
    <TouchableOpacity
      testID={`schedule-item-${item.id}`}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/schedule', params: { id: String(item.id) } })}
      style={styles.card}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.carName} testID={`schedule-car-name-${item.id}`} numberOfLines={1}>
          {item.carName}
        </Text>
        <Text style={styles.carModel} numberOfLines={1}>
          {item.carModel}
        </Text>
        <View style={styles.timeRow}>
          <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
          <Text style={styles.timeText}>{formatDateShort(item.pickupTime)}</Text>
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={styles.timeText}>{formatTimeShort(item.pickupTime)}</Text>
        </View>
      </View>
      <TouchableOpacity
        testID={`schedule-delete-btn-${item.id}`}
        onPress={(e) => {
          e.stopPropagation?.();
          handleDelete(item);
        }}
        style={styles.deleteBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap} testID="empty-state">
      <Image
        source={{
          uri: 'https://images.pexels.com/photos/4665714/pexels-photo-4665714.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        }}
        style={styles.emptyImage}
        resizeMode="cover"
      />
      <View style={styles.emptyOverlay} />
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>
          {search ? 'Nenhum resultado' : 'Nenhum agendamento'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {search
            ? 'Tente buscar por outro nome de carro.'
            : 'Toque em + para criar seu primeiro agendamento.'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>LAVA JATO</Text>
          <Text style={styles.brandSub}>Agenda</Text>
        </View>
        <View style={styles.counterPill} testID="schedule-counter">
          <Text style={styles.counterText}>{schedules.length}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          testID="search-input"
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nome do carro..."
          placeholderTextColor="#8E8E93"
          style={styles.searchInput}
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
            <Ionicons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        testID="schedule-list"
        style={styles.list}
        data={filtered}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={
          filtered.length === 0 ? styles.listEmptyContent : styles.listContent
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      />

      <TouchableOpacity
        testID="fab-add-schedule"
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => router.push('/schedule')}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSub: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -2,
  },
  counterPill: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    minWidth: 40,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 0,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 4 },
  listEmptyContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: { flex: 1, paddingRight: 12 },
  carName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  carModel: { color: '#8E8E93', fontSize: 13, marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { color: '#C7C7CC', fontSize: 13, marginLeft: 4, fontWeight: '600' },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 8,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emptyWrap: {
    flex: 1,
    minHeight: 420,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 8,
  },
  emptyImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.78)',
  },
  emptyContent: { padding: 24, alignItems: 'center' },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#C7C7CC',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
