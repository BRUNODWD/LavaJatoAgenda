import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listSchedules, Schedule } from '../../src/db';
import { formatBRL, formatTimeShort, isoDateOnly } from '../../src/format';
import { statusColor } from '../../src/status';
import { useTheme } from '../../src/theme';

export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const load = useCallback(async () => {
    const data = await listSchedules();
    setSchedules(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selectedIso = useMemo(() => isoDateOnly(date.toISOString()), [date]);

  const dayItems = useMemo(
    () =>
      schedules
        .filter((s) => s.dataAgendamento === selectedIso)
        .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime)),
    [schedules, selectedIso]
  );

  const shiftDays = (n: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + n);
    setDate(next);
  };

  const totalValor = dayItems
    .filter((s) => s.status !== 'Cancelado')
    .reduce((sum, s) => sum + (s.valor || 0), 0);

  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const onChangeDate = (_: any, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (selected) {
      const d = new Date(selected);
      d.setHours(0, 0, 0, 0);
      setDate(d);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Calendário</Text>
      </View>

      <View
        style={[
          styles.dateCard,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <TouchableOpacity
          testID="calendar-prev-day"
          onPress={() => shiftDays(-1)}
          style={[styles.navBtn, { backgroundColor: theme.primary + '15' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          testID="calendar-open-picker"
          style={styles.dateCenter}
          activeOpacity={0.7}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.dateLarge, { color: theme.textPrimary }]}>
            {String(date.getDate()).padStart(2, '0')}
          </Text>
          <Text
            style={[styles.dateLabel, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {formattedDate}
          </Text>
          <View style={[styles.pickerHint, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="calendar" size={12} color={theme.primary} />
            <Text style={[styles.pickerHintText, { color: theme.primary }]}>
              Trocar data
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          testID="calendar-next-day"
          onPress={() => shiftDays(1)}
          style={[styles.navBtn, { backgroundColor: theme.primary + '15' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.statValue, { color: theme.primary }]} testID="calendar-day-count">
            {dayItems.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            agendamentos
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.statValue, { color: theme.positive }]}>
            {formatBRL(totalValor)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            previsto no dia
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {dayItems.length === 0 ? (
          <View testID="calendar-empty" style={styles.empty}>
            <Ionicons name="calendar-clear-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Sem agendamentos
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Não há serviços marcados para este dia.
            </Text>
          </View>
        ) : (
          dayItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              testID={`calendar-item-${item.id}`}
              activeOpacity={0.7}
              onPress={() =>
                router.push({ pathname: '/schedule', params: { id: String(item.id) } })
              }
              style={[
                styles.itemCard,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              ]}
            >
              <View style={[styles.timeBlock, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.timeText, { color: theme.primary }]}>
                  {formatTimeShort(item.pickupTime)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.itemName, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.carName}
                </Text>
                <Text
                  style={[styles.itemModel, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.carModel}
                </Text>
                <View style={styles.itemFooter}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusColor(item.status) + '22' },
                    ]}
                  >
                    <Text
                      style={[styles.badgeText, { color: statusColor(item.status) }]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text style={[styles.valor, { color: theme.positive }]}>
                    {formatBRL(item.valor)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          testID="calendar-date-picker"
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          themeVariant={theme.mode}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: 0.3 },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(13,71,161,0.06)' as any }
      : {
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }),
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateLarge: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  dateLabel: {
    fontSize: 12,
    marginTop: -4,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  pickerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  pickerHintText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  statBox: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptyText: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  itemCard: {
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
  itemName: { fontSize: 15, fontWeight: '800' },
  itemModel: { fontSize: 12, marginTop: 2 },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  valor: { fontSize: 13, fontWeight: '800' },
});
