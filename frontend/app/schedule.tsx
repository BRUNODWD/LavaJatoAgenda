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
import { formatDateShort, formatTimeShort } from '../src/format';

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id ? Number(params.id) : null;
  const isEditing = editingId !== null && !Number.isNaN(editingId);

  const [carName, setCarName] = useState('');
  const [carModel, setCarModel] = useState('');
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
      if (isEditing && editingId !== null) {
        await updateSchedule(editingId, carName.trim(), carModel.trim(), pickup.toISOString());
      } else {
        await createSchedule(carName.trim(), carModel.trim(), pickup.toISOString());
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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>
            {isEditing ? 'Editar agendamento' : 'Novo agendamento'}
          </Text>
          <Text style={styles.sub}>
            Preencha os dados do carro e o horário da retirada.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nome do carro</Text>
            <TextInput
              testID="input-car-name"
              value={carName}
              onChangeText={(t) => {
                setCarName(t);
                if (errors.carName) setErrors((p) => ({ ...p, carName: undefined }));
              }}
              placeholder="Ex: Civic do João"
              placeholderTextColor="#6C6C70"
              style={[styles.input, errors.carName ? styles.inputError : null]}
              autoCapitalize="words"
            />
            {errors.carName ? (
              <Text style={styles.errorText}>{errors.carName}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Modelo do carro</Text>
            <TextInput
              testID="input-car-model"
              value={carModel}
              onChangeText={(t) => {
                setCarModel(t);
                if (errors.carModel) setErrors((p) => ({ ...p, carModel: undefined }));
              }}
              placeholder="Ex: Honda Civic 2020"
              placeholderTextColor="#6C6C70"
              style={[styles.input, errors.carModel ? styles.inputError : null]}
              autoCapitalize="words"
            />
            {errors.carModel ? (
              <Text style={styles.errorText}>{errors.carModel}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Horário da retirada</Text>
            <View style={styles.row}>
              <TouchableOpacity
                testID="pickup-date-btn"
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color="#007AFF" />
                <Text style={styles.dateBtnText}>
                  {formatDateShort(pickup.toISOString())}/{pickup.getFullYear()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="pickup-time-btn"
                style={styles.dateBtn}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={18} color="#007AFF" />
                <Text style={styles.dateBtnText}>
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
              themeVariant="dark"
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
              themeVariant="dark"
            />
          )}

          <TouchableOpacity
            testID="save-schedule-btn"
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
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
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sub: { color: '#8E8E93', fontSize: 14, marginBottom: 28 },
  field: { marginBottom: 20 },
  label: {
    color: '#C7C7CC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', gap: 12 },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  dateBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 16,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelBtnText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
});
