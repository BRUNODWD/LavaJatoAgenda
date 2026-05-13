import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createSchedule,
  getScheduleById,
  updateSchedule,
} from '../src/db';
import { formatBRL, formatDateShort, formatTimeShort, parseValueInput } from '../src/format';
import { STATUSES, Status, statusColor } from '../src/status';
import { useTheme } from '../src/theme';

export default function ScheduleScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id ? Number(params.id) : null;
  const isEditing = editingId !== null && !Number.isNaN(editingId);

  const [carName, setCarName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<Status>('Agendado');
  const [pickup, setPickup] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ carName?: string; carModel?: string }>({});

  useEffect(() => {
    (async () => {
      if (!isEditing || editingId === null) return;
      const row = await getScheduleById(editingId);
      if (row) {
        setCarName(row.carName);
        setCarModel(row.carModel);
        setStatus(row.status);
        setValor(row.valor ? String(row.valor).replace('.', ',') : '');
        const d = new Date(row.pickupTime);
        if (!isNaN(d.getTime())) setPickup(d);
      }
    })();
  }, [isEditing, editingId]);

  const validate = () => {
    const e: { carName?: string; carModel?: string } = {};
    if (!carName.trim()) e.carName = 'Informe o nome do carro';
    if (!carModel.trim()) e.carModel = 'Informe o modelo do carro';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const valorNum = parseValueInput(valor);
      if (isEditing && editingId !== null) {
        await updateSchedule(editingId, carName.trim(), carModel.trim(), pickup.toISOString(), status, valorNum);
      } else {
        await createSchedule(carName.trim(), carModel.trim(), pickup.toISOString(), status, valorNum);
      }
      router.back();
    } catch (e) {
      console.warn(e);
      Alert.alert('Erro', 'Não foi possível salvar o agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const onChangeDate = (_: any, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selected) {
      const next = new Date(pickup);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setPickup(next);
    }
  };

  const onChangeTime = (_: any, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (selected) {
      const next = new Date(pickup);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setPickup(next);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.heading, { color: theme.textPrimary }]}>
            {isEditing ? 'Editar agendamento' : 'Novo agendamento'}
          </Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>
            Preencha os dados do cliente, valor e horário.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nome do cliente</Text>
            <TextInput
              testID="input-car-name"
              value={carName}
              onChangeText={(t) => {
                setCarName(t);
                if (errors.carName) setErrors((p) => ({ ...p, carName: undefined }));
              }}
              placeholder="Ex: Civic do João"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: errors.carName ? theme.danger : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              autoCapitalize="words"
            />
            {errors.carName ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>{errors.carName}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Modelo do carro</Text>
            <TextInput
              testID="input-car-model"
              value={carModel}
              onChangeText={(t) => {
                setCarModel(t);
                if (errors.carModel) setErrors((p) => ({ ...p, carModel: undefined }));
              }}
              placeholder="Ex: Honda Civic 2020"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: errors.carModel ? theme.danger : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              autoCapitalize="words"
            />
            {errors.carModel ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>{errors.carModel}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Valor (R$)</Text>
            <TextInput
              testID="input-valor"
              value={valor}
              onChangeText={setValor}
              placeholder="0,00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary },
              ]}
            />
            {valor ? (
              <Text style={[styles.hintRight, { color: theme.positive }]}>
                {formatBRL(parseValueInput(valor))}
              </Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Status</Text>
            <View style={styles.statusRow}>
              {STATUSES.map((s) => {
                const active = status === s;
                const c = statusColor(s);
                return (
                  <TouchableOpacity
                    key={s}
                    testID={`status-option-${s.replace(/\s+/g, '-').toLowerCase()}`}
                    onPress={() => setStatus(s)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: active ? c + '22' : theme.surface,
                        borderColor: active ? c : theme.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.statusDot, { backgroundColor: c }]} />
                    <Text
                      style={[
                        styles.statusChipText,
                        { color: active ? c : theme.textPrimary },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Horário da retirada
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                testID="pickup-date-btn"
                style={[
                  styles.dateBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                <Text style={[styles.dateBtnText, { color: theme.textPrimary }]}>
                  {formatDateShort(pickup.toISOString())}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="pickup-time-btn"
                style={[
                  styles.dateBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={18} color={theme.primary} />
                <Text style={[styles.dateBtnText, { color: theme.textPrimary }]}>
                  {formatTimeShort(pickup.toISOString())}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="date-picker"
              value={pickup}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
              themeVariant={theme.mode}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              testID="time-picker"
              value={pickup}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeTime}
              themeVariant={theme.mode}
            />
          )}

          <TouchableOpacity
            testID="save-schedule-btn"
            style={[
              styles.saveBtn,
              { backgroundColor: theme.primary },
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {isEditing ? 'Atualizar' : 'Salvar agendamento'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="cancel-btn"
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '900', marginBottom: 4, letterSpacing: 0.2 },
  sub: { fontSize: 13, marginBottom: 24 },
  field: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  hintRight: { fontSize: 12, marginTop: 6, fontWeight: '700' },
  errorText: { fontSize: 12, marginTop: 6 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  row: { flexDirection: 'row', gap: 12 },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateBtnText: { fontSize: 14, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 12,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 4 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
});
