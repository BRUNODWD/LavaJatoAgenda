import * as SQLite from 'expo-sqlite';
import type { Status } from './status';

export type Schedule = {
  id: number;
  carName: string;
  carModel: string;
  pickupTime: string; // ISO datetime
  status: Status;
  valor: number;
  dataAgendamento: string; // YYYY-MM-DD (derived from pickupTime)
  createdAt: string;
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('lavajato.db');

  // Base table (matches v1)
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

  // Migration v2: add status, valor, dataAgendamento (idempotent — only adds if missing)
  const cols = await dbInstance.getAllAsync<{ name: string }>(
    "PRAGMA table_info(schedules);"
  );
  const colNames = cols.map((c) => c.name);

  if (!colNames.includes('status')) {
    await dbInstance.execAsync(
      "ALTER TABLE schedules ADD COLUMN status TEXT NOT NULL DEFAULT 'Agendado';"
    );
  }
  if (!colNames.includes('valor')) {
    await dbInstance.execAsync(
      'ALTER TABLE schedules ADD COLUMN valor REAL NOT NULL DEFAULT 0;'
    );
  }
  if (!colNames.includes('dataAgendamento')) {
    await dbInstance.execAsync(
      "ALTER TABLE schedules ADD COLUMN dataAgendamento TEXT NOT NULL DEFAULT '';"
    );
    // Backfill from existing pickupTime values
    const rows = await dbInstance.getAllAsync<{ id: number; pickupTime: string }>(
      'SELECT id, pickupTime FROM schedules WHERE dataAgendamento = ""'
    );
    for (const r of rows) {
      const d = new Date(r.pickupTime);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;
        await dbInstance.runAsync(
          'UPDATE schedules SET dataAgendamento = ? WHERE id = ?',
          isoDate,
          r.id
        );
      }
    }
  }

  return dbInstance;
}

function deriveDate(pickupTime: string): string {
  const d = new Date(pickupTime);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function listSchedules(): Promise<Schedule[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Schedule>(
    'SELECT id, carName, carModel, pickupTime, status, valor, dataAgendamento, createdAt FROM schedules ORDER BY pickupTime ASC'
  );
  return rows;
}

export async function createSchedule(
  carName: string,
  carModel: string,
  pickupTime: string,
  status: Status,
  valor: number
): Promise<number> {
  const db = await getDb();
  const dataAgendamento = deriveDate(pickupTime);
  const result = await db.runAsync(
    'INSERT INTO schedules (carName, carModel, pickupTime, status, valor, dataAgendamento, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    carName,
    carModel,
    pickupTime,
    status,
    valor,
    dataAgendamento,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function updateSchedule(
  id: number,
  carName: string,
  carModel: string,
  pickupTime: string,
  status: Status,
  valor: number
): Promise<void> {
  const db = await getDb();
  const dataAgendamento = deriveDate(pickupTime);
  await db.runAsync(
    'UPDATE schedules SET carName = ?, carModel = ?, pickupTime = ?, status = ?, valor = ?, dataAgendamento = ? WHERE id = ?',
    carName,
    carModel,
    pickupTime,
    status,
    valor,
    dataAgendamento,
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
    'SELECT id, carName, carModel, pickupTime, status, valor, dataAgendamento, createdAt FROM schedules WHERE id = ?',
    id
  );
  return row ?? null;
}
