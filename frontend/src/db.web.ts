// Web fallback using localStorage (preview-only). Native uses expo-sqlite.

import type { Status } from './status';

export type Schedule = {
  id: number;
  carName: string;
  carModel: string;
  pickupTime: string;
  status: Status;
  valor: number;
  dataAgendamento: string;
  createdAt: string;
};

const KEY = 'lavajato:schedules:v2';
const LEGACY_KEY = 'lavajato:schedules';

function deriveDate(pickupTime: string): string {
  const d = new Date(pickupTime);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function migrate(items: any[]): Schedule[] {
  return items.map((i) => ({
    id: i.id,
    carName: i.carName,
    carModel: i.carModel,
    pickupTime: i.pickupTime,
    status: (i.status as Status) || 'Agendado',
    valor: typeof i.valor === 'number' ? i.valor : 0,
    dataAgendamento: i.dataAgendamento || deriveDate(i.pickupTime),
    createdAt: i.createdAt || new Date().toISOString(),
  }));
}

function readAll(): Schedule[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Schedule[];
    // Migrate legacy v1 data if present
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = migrate(JSON.parse(legacy));
      window.localStorage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

function writeAll(items: Schedule[]) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export async function getDb(): Promise<void> {
  // no-op
}

export async function listSchedules(): Promise<Schedule[]> {
  const items = readAll();
  return [...items].sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
}

export async function createSchedule(
  carName: string,
  carModel: string,
  pickupTime: string,
  status: Status,
  valor: number
): Promise<number> {
  const items = readAll();
  const id = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  const row: Schedule = {
    id,
    carName,
    carModel,
    pickupTime,
    status,
    valor,
    dataAgendamento: deriveDate(pickupTime),
    createdAt: new Date().toISOString(),
  };
  items.push(row);
  writeAll(items);
  return id;
}

export async function updateSchedule(
  id: number,
  carName: string,
  carModel: string,
  pickupTime: string,
  status: Status,
  valor: number
): Promise<void> {
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = {
    ...items[idx],
    carName,
    carModel,
    pickupTime,
    status,
    valor,
    dataAgendamento: deriveDate(pickupTime),
  };
  writeAll(items);
}

export async function deleteSchedule(id: number): Promise<void> {
  const items = readAll().filter((i) => i.id !== id);
  writeAll(items);
}

export async function getScheduleById(id: number): Promise<Schedule | null> {
  return readAll().find((i) => i.id === id) ?? null;
}
