import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listSchedules, Schedule } from '../../src/db';
import { formatBRL, formatTimeShort, todayIsoDate } from '../../src/format';
import { statusColor } from '../../src/status';
import { useTheme } from '../../src/theme';

type Stat = {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  hint?: string;
};

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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

  const stats = useMemo(() => {
    const today = todayIsoDate();
    const todays = schedules.filter((s) => s.dataAgendamento === today);
    const totalToday = todays.length;
    const faturadoToday = todays
      .filter((s) => s.status !== 'Cancelado')
      .reduce((sum, s) => sum + (s.valor || 0), 0);
    const concluidos = todays.filter((s) => s.status === 'Finalizado').length;

    const now = new Date();
    const pendentes = todays
      .filter(
        (s) =>
          s.status !== 'Finalizado' &&
          s.status !== 'Cancelado' &&
          new Date(s.pickupTime) >= now
      )
      .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    const proximo = pendentes[0];

    const result: Stat[] = [
      {
        key: 'today',
        label: 'Carros hoje',
        value: String(totalToday),
        icon: 'car-sport',
        color: theme.primary,
      },
      {
        key: 'revenue',
        label: 'Faturado hoje',
        value: formatBRL(faturadoToday),
        icon: 'cash',
        color: theme.positive,
      },
      {
        key: 'done',
        label: 'Concluídos',
        value: String(concluidos),
        icon: 'checkmark-circle',
        color: theme.statusGreen,
      },
      {
        key: 'next',
        label: 'Próximo horário',
        value: proximo ? formatTimeShort(proximo.pickupTime) : '—',
        icon: 'time',
        color: theme.statusOrange,
        hint: proximo ? proximo.carName : 'sem pendências',
      },
    ];
    return result;
  }, [schedules, theme]);

  const today = todayIsoDate();
  const todays = schedules.filter((s) => s.dataAgendamento === today);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.brand, { color: theme.textPrimary }]}>LavaJato</Text>
              <Text style={[styles.brandSub, { color: theme.primary }]}>
                Agenda Profissional
              </Text>
            </View>
          </View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Resumo de hoje · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View
              key={s.key}
              testID={`dashboard-card-${s.key}`}
              style={[
                styles.card,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <View style={[styles.iconBubble, { backgroundColor: s.color + '22' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={[styles.cardValue, { color: theme.textPrimary }]} numberOfLines={1}>
                {s.value}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {s.label}
              </Text>
              {s.hint ? (
                <Text style={[styles.cardHint, { color: theme.textSecondary }]} numberOfLines={1}>
                  {s.hint}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Agendamentos de hoje
          </Text>
          <TouchableOpacity
            testID="dashboard-see-all"
            onPress={() => router.push('/agenda')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.seeAll, { color: theme.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {todays.length === 0 ? (
          <View
            testID="dashboard-empty"
            style={[
              styles.emptyCard,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <Ionicons name="calendar-outline" size={40} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Nenhum agendamento hoje
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Toque em &quot;+&quot; na aba Agenda para criar.
            </Text>
          </View>
        ) : (
          todays.map((s) => (
            <TouchableOpacity
              key={s.id}
              testID={`dashboard-item-${s.id}`}
              activeOpacity={0.8}
              onPress={() =>
                router.push({ pathname: '/schedule', params: { id: String(s.id) } })
              }
              style={[
                styles.todayItem,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              ]}
            >
              <View style={[styles.timeBlock, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.timeText, { color: theme.primary }]}>
                  {formatTimeShort(s.pickupTime)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {s.carName}
                </Text>
                <Text style={[styles.itemModel, { color: theme.textSecondary }]} numberOfLines={1}>
                  {s.carModel} · {formatBRL(s.valor)}
                </Text>
              </View>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor(s.status) }]}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 12 },
  logo: { width: 52, height: 52, borderRadius: 26 },
  brand: { fontSize: 26, fontWeight: '900', letterSpacing: 0.3 },
  brandSub: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: -2 },
  greeting: { fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '47.5%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(13,71,161,0.06)' as any }
      : {
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }),
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardValue: { fontSize: 22, fontWeight: '900', letterSpacing: 0.2 },
  cardLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  cardHint: { fontSize: 11, marginTop: 6, fontStyle: 'italic' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  seeAll: { fontSize: 13, fontWeight: '700' },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 12 },
  emptyText: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  todayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  timeBlock: {
    width: 60,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeText: { fontSize: 14, fontWeight: '800' },
  itemName: { fontSize: 15, fontWeight: '800' },
  itemModel: { fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
