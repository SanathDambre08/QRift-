import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type {  ScanReport  } from '@qrift/shared';

interface QRiftDB extends DBSchema {
  scans: {
    key: string; // scanId
    value: ScanReport;
    indexes: { 'by-created': string };
  };
}

let dbPromise: Promise<IDBPDatabase<QRiftDB>>;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<QRiftDB>('qrift-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('scans', { keyPath: 'scanId' });
        store.createIndex('by-created', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function saveScanReport(report: ScanReport): Promise<void> {
  const db = await getDB();
  await db.put('scans', report);
}

export async function getScanReport(scanId: string): Promise<ScanReport | undefined> {
  const db = await getDB();
  return db.get('scans', scanId);
}

export async function getAllScans(): Promise<ScanReport[]> {
  const db = await getDB();
  return db.getAllFromIndex('scans', 'by-created');
}
