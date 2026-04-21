import * as SQLite from 'expo-sqlite';

export type Schedule = {
  id: number;
  carName: string;
  carModel: string;
  pickupTime: string; // ISO string
  createdAt: string;
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('lavajato.db');
  await dbInstance.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carName TEXT NOT NULL,
      carModel TEXT NOT NULL,
      pickupTime TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  return dbInstance;
}

export async function listSchedules(): Promise<Schedule[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Schedule>(
    'SELECT id, carName, carModel, pickupTime, createdAt FROM schedules ORDER BY pickupTime ASC'
  );
  return rows;
}

export async function createSchedule(
  carName: string,
  carModel: string,
  pickupTime: string
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO schedules (carName, carModel, pickupTime, createdAt) VALUES (?, ?, ?, ?)',
    carName,
    carModel,
    pickupTime,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function updateSchedule(
  id: number,
  carName: string,
  carModel: string,
  pickupTime: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE schedules SET carName = ?, carModel = ?, pickupTime = ? WHERE id = ?',
    carName,
    carModel,
    pickupTime,
    id
  );
}

export async function deleteSchedule(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM schedules WHERE id = ?', id);
}

export async function getScheduleById(id: number): Promise<Schedule | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Schedule>(
    'SELECT id, carName, carModel, pickupTime, createdAt FROM schedules WHERE id = ?',
    id
  );
  return row ?? null;
}
