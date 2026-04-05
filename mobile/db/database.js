import * as SQLite from 'expo-sqlite';

import { DB_NAME, DDL } from './schema';
import { seedDemoIfEmpty, seedDriverFleetIfNeeded } from './seedDemo';

let dbInstance = null;
let initialized = false;

function migrateLocalDatabase(db) {
  const userCols = db.getAllSync('PRAGMA table_info(users)');
  const userNames = new Set(userCols.map((r) => r.name));
  if (!userNames.has('avatar_uri')) {
    db.execSync('ALTER TABLE users ADD COLUMN avatar_uri TEXT');
  }

  const rideCols = db.getAllSync('PRAGMA table_info(rides)');
  const rideNames = new Set(rideCols.map((r) => r.name));
  if (!rideNames.has('payment_method')) {
    db.execSync('ALTER TABLE rides ADD COLUMN payment_method TEXT');
  }
  if (!rideNames.has('ride_type')) {
    db.execSync('ALTER TABLE rides ADD COLUMN ride_type TEXT');
  }
  if (!rideNames.has('route_distance_km')) {
    db.execSync('ALTER TABLE rides ADD COLUMN route_distance_km REAL');
  }
  if (!rideNames.has('duration_minutes')) {
    db.execSync('ALTER TABLE rides ADD COLUMN duration_minutes INTEGER');
  }

  const providerCols = db.getAllSync('PRAGMA table_info(provider_profiles)');
  const providerNames = new Set(providerCols.map((r) => r.name));
  if (!providerNames.has('document_photo_uri')) {
    db.execSync('ALTER TABLE provider_profiles ADD COLUMN document_photo_uri TEXT');
  }
  if (!providerNames.has('license_photo_uri')) {
    db.execSync('ALTER TABLE provider_profiles ADD COLUMN license_photo_uri TEXT');
  }

  const vehicleCols = db.getAllSync('PRAGMA table_info(vehicles)');
  const vehicleNames = new Set(vehicleCols.map((r) => r.name));
  if (!vehicleNames.has('photo_uri')) {
    db.execSync('ALTER TABLE vehicles ADD COLUMN photo_uri TEXT');
  }
}

/**
 * Base local para **demo** / desenvolvimento sem API.
 * Usa **SQLite 3** nativo (iOS/Android) via pacote `expo-sqlite` — não é o pacote Node `sqlite3`.
 */
export function initLocalDatabase() {
  if (initialized) {
    return getLocalDatabase();
  }

  const db = SQLite.openDatabaseSync(DB_NAME);
  db.execSync(DDL);
  migrateLocalDatabase(db);
  seedDemoIfEmpty(db);
  seedDriverFleetIfNeeded(db);

  dbInstance = db;
  initialized = true;
  return db;
}

/** Instância síncrona expo-sqlite (após initLocalDatabase). */
export function getLocalDatabase() {
  if (!dbInstance) {
    throw new Error('Base local não inicializada: chame initLocalDatabase() primeiro.');
  }
  return dbInstance;
}

/**
 * Executa SQL com bind (uso típico: INSERT/UPDATE).
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {{ lastInsertRowId: number; changes: number }}
 */
export function runSync(sql, params = []) {
  return getLocalDatabase().runSync(sql, params);
}

/**
 * Primeira linha ou null.
 * @param {string} sql
 * @param {unknown[]} params
 */
export function getFirstSync(sql, params = []) {
  return getLocalDatabase().getFirstSync(sql, params);
}

/**
 * Todas as linhas.
 * @param {string} sql
 * @param {unknown[]} params
 */
export function getAllSync(sql, params = []) {
  return getLocalDatabase().getAllSync(sql, params);
}
