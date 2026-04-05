/**
 * Schema **SQLite 3** local (ficheiro no dispositivo) para demo / dev sem API.
 * Espelha oholo_mvp_modelagem.md (MVP). ENUMs → TEXT + CHECK; datas → TEXT.
 */

export const DB_NAME = 'oholo_local.db';

/** Incrementar quando alterar o DDL abaixo (ver database.js). */
export const SCHEMA_VERSION = 3;

export const DDL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','blocked')),
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
-- Coluna avatar_uri: adicionada em bases existentes via migrateLocalDatabase (ALTER TABLE).

CREATE TABLE IF NOT EXISTS provider_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('driver','courier','both')),
  document_number TEXT NOT NULL,
  license_number TEXT,
  availability_status TEXT NOT NULL DEFAULT 'offline' CHECK (availability_status IN ('available','busy','offline')),
  rating_avg REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  provider_profile_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car','motorbike','van')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  address_line TEXT NOT NULL,
  bairro TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  reference_note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  ride_code TEXT NOT NULL UNIQUE,
  customer_user_id INTEGER NOT NULL REFERENCES users(id),
  driver_user_id INTEGER REFERENCES users(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  pickup_location_id INTEGER NOT NULL REFERENCES locations(id),
  dropoff_location_id INTEGER NOT NULL REFERENCES locations(id),
  estimated_fare REAL NOT NULL,
  final_fare REAL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','accepted','in_progress','completed','cancelled')),
  requested_at TEXT NOT NULL,
  accepted_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
-- Colunas extras na tabela rides (pagamento, tipo, métricas): migrateLocalDatabase (ALTER TABLE).

CREATE TABLE IF NOT EXISTS deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  delivery_code TEXT NOT NULL UNIQUE,
  customer_user_id INTEGER NOT NULL REFERENCES users(id),
  courier_user_id INTEGER REFERENCES users(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  pickup_location_id INTEGER NOT NULL REFERENCES locations(id),
  dropoff_location_id INTEGER NOT NULL REFERENCES locations(id),
  item_description TEXT NOT NULL,
  delivery_fee REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','accepted','picked_up','in_transit','delivered','cancelled')),
  requested_at TEXT NOT NULL,
  accepted_at TEXT,
  picked_up_at TEXT,
  delivered_at TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transport_companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  transport_company_id INTEGER NOT NULL REFERENCES transport_companies(id),
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  estimated_duration TEXT,
  base_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trip_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  route_id INTEGER NOT NULL REFERENCES routes(id),
  departure_datetime TEXT NOT NULL,
  arrival_datetime TEXT,
  price REAL NOT NULL,
  available_seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','departed','completed','cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ticket_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  booking_code TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  trip_schedule_id INTEGER NOT NULL REFERENCES trip_schedules(id),
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  seat_number TEXT,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','used')),
  booked_at TEXT NOT NULL,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('ride','delivery','ticket')),
  reference_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','mpesa','emola','card')),
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rides_customer ON rides(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON deliveries(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_bookings_user ON ticket_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
`;
