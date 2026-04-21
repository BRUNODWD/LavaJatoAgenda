// Web fallback using localStorage (mobile preview runs in web; native uses expo-sqlite via db.native.ts).

export type Schedule = {
  id: number;
  carName: string;
  carModel: string;
  pickupTime: string;
  createdAt: string;
};

const KEY = 'lavajato:schedules';

function readAll(): Schedule[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Schedule[];
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
  // no-op on web
}

export async function listSchedules(): Promise<Schedule[]> {
  const items = readAll();
  return [...items].sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
}

export async function createSchedule(
  carName: string,
  carModel: string,
  pickupTime: string
): Promise<number> {
  const items = readAll();
  const id = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  const row: Schedule = {
    id,
    carName,
    carModel,
    pickupTime,
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
  pickupTime: string
): Promise<void> {
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], carName, carModel, pickupTime };
  writeAll(items);
}

export async function deleteSchedule(id: number): Promise<void> {
  const items = readAll().filter((i) => i.id !== id);
  writeAll(items);
}

export async function getScheduleById(id: number): Promise<Schedule | null> {
  const found = readAll().find((i) => i.id === id);
  return found ?? null;
}
