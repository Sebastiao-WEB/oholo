/**
 * Dados de demonstração na base local **SQLite 3** (via expo-sqlite).
 * Cliente demo: só quando a tabela `users` está vazia.
 * Frota de motoristas: idempotente (telefones +258879991001–015).
 */

/** Desativa se quiseres base vazia em builds de teste. */
export const DEMO_SEED_ENABLED = true;

/** Mesma palavra-passe que o utilizador demo: `oholo-demo` (SHA-256). */
const DEMO_PASSWORD_HASH =
  'sha256:e0e576e38960f88543e22c748e9c8011615ce9c0f2676630232ed44e367615b6';

/**
 * 15 motoristas: 8 mulheres (F), 7 homens (M) — género só documentado aqui; não há coluna na BD.
 * Telefones +258879991001 … +258879991015 (prefixo 87 válido em MZ).
 */
const DRIVER_FLEET = [
  {
    gender: 'F',
    name: 'Ana Maria Tembe',
    phone: '+258879991001',
    doc: '110123450001A',
    license: 'CNH-MZ-240001',
    vehicle: { type: 'car', brand: 'Toyota', model: 'Corolla', plate: 'NPL-23-101-MZ', color: 'Branco' },
    rating: 4.65,
  },
  {
    gender: 'F',
    name: 'Lucia Carlos Nhaca',
    phone: '+258879991002',
    doc: '110123450002A',
    license: 'CNH-MZ-240002',
    vehicle: { type: 'motorbike', brand: 'Honda', model: 'Biz 125', plate: 'NPL-24-102-MZ', color: 'Vermelho' },
    rating: 4.42,
  },
  {
    gender: 'F',
    name: 'Fatima Abdul Amisse',
    phone: '+258879991003',
    doc: '110123450003A',
    license: 'CNH-MZ-240003',
    vehicle: { type: 'car', brand: 'Nissan', model: 'March', plate: 'NPL-23-103-MZ', color: 'Prateado' },
    rating: 4.78,
  },
  {
    gender: 'F',
    name: 'Rosa Elias Macuacua',
    phone: '+258879991004',
    doc: '110123450004A',
    license: 'CNH-MZ-240004',
    vehicle: { type: 'van', brand: 'Toyota', model: 'HiAce', plate: 'NPL-22-104-MZ', color: 'Branco' },
    rating: 4.55,
  },
  {
    gender: 'F',
    name: 'Helena Joao Cumbane',
    phone: '+258879991005',
    doc: '110123450005A',
    license: 'CNH-MZ-240005',
    vehicle: { type: 'car', brand: 'Honda', model: 'Fit', plate: 'NPL-24-105-MZ', color: 'Azul' },
    rating: 4.38,
  },
  {
    gender: 'F',
    name: 'Teresa Ernesto Manhique',
    phone: '+258879991006',
    doc: '110123450006A',
    license: 'CNH-MZ-240006',
    vehicle: { type: 'motorbike', brand: 'Yamaha', model: 'FZ-S', plate: 'NPL-23-106-MZ', color: 'Branco' },
    rating: 4.5,
  },
  {
    gender: 'F',
    name: 'Graca Francisco Matsinhe',
    phone: '+258879991007',
    doc: '110123450007A',
    license: 'CNH-MZ-240007',
    vehicle: { type: 'car', brand: 'Volkswagen', model: 'Polo', plate: 'NPL-24-107-MZ', color: 'Cinzento' },
    rating: 4.62,
  },
  {
    gender: 'F',
    name: 'Silvia Andre Mabunda',
    phone: '+258879991008',
    doc: '110123450008A',
    license: 'CNH-MZ-240008',
    vehicle: { type: 'car', brand: 'Suzuki', model: 'Swift', plate: 'NPL-23-108-MZ', color: 'Vermelho' },
    rating: 4.71,
  },
  {
    gender: 'M',
    name: 'Paulo Ernesto Ubisse',
    phone: '+258879991009',
    doc: '110123450009A',
    license: 'CNH-MZ-240009',
    vehicle: { type: 'car', brand: 'Toyota', model: 'Vitz', plate: 'NPL-23-109-MZ', color: 'Branco' },
    rating: 4.58,
  },
  {
    gender: 'M',
    name: 'Carlos Alberto Tembe',
    phone: '+258879991010',
    doc: '110123450010A',
    license: 'CNH-MZ-240010',
    vehicle: { type: 'motorbike', brand: 'Honda', model: 'CG 125', plate: 'NPL-24-110-MZ', color: 'Preto' },
    rating: 4.33,
  },
  {
    gender: 'M',
    name: 'Manuel Joao Nhampossa',
    phone: '+258879991011',
    doc: '110123450011A',
    license: 'CNH-MZ-240011',
    vehicle: { type: 'van', brand: 'Mercedes-Benz', model: 'Sprinter', plate: 'NPL-21-111-MZ', color: 'Prateado' },
    rating: 4.81,
  },
  {
    gender: 'M',
    name: 'Armando Luis Macome',
    phone: '+258879991012',
    doc: '110123450012A',
    license: 'CNH-MZ-240012',
    vehicle: { type: 'car', brand: 'Mazda', model: 'Demio', plate: 'NPL-24-112-MZ', color: 'Azul' },
    rating: 4.46,
  },
  {
    gender: 'M',
    name: 'Eduardo Salimo Zandamela',
    phone: '+258879991013',
    doc: '110123450013A',
    license: 'CNH-MZ-240013',
    vehicle: { type: 'car', brand: 'Nissan', model: 'Note', plate: 'NPL-23-113-MZ', color: 'Branco' },
    rating: 4.69,
  },
  {
    gender: 'M',
    name: 'Jorge Vicente Cossa',
    phone: '+258879991014',
    doc: '110123450014A',
    license: 'CNH-MZ-240014',
    vehicle: { type: 'motorbike', brand: 'Bajaj', model: 'Boxer', plate: 'NPL-24-114-MZ', color: 'Amarelo' },
    rating: 4.28,
  },
  {
    gender: 'M',
    name: 'Antonio Manuel Langa',
    phone: '+258879991015',
    doc: '110123450015A',
    license: 'CNH-MZ-240015',
    vehicle: { type: 'car', brand: 'Hyundai', model: 'i10', plate: 'NPL-24-115-MZ', color: 'Preto' },
    rating: 4.52,
  },
];

/**
 * @param {import('expo-sqlite').SQLiteDatabase} db
 */
export function seedDemoIfEmpty(db) {
  if (!DEMO_SEED_ENABLED) {
    return;
  }

  const row = db.getFirstSync('SELECT COUNT(*) AS cnt FROM users');
  const count = row?.cnt != null ? Number(row.cnt) : 0;
  if (count > 0) {
    return;
  }

  const rUser = db.runSync(
    `INSERT INTO users (name, phone, email, password, status, is_admin)
     VALUES (?, ?, ?, ?, 'active', 0)`,
    ['Demo Oholo', '+258840000000', 'demo@oholo.local', DEMO_PASSWORD_HASH]
  );
  const userId = rUser.lastInsertRowId;

  const rLoc1 = db.runSync(
    `INSERT INTO locations (address_line, bairro, city, province, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Mercado central', 'Central', 'Nampula', 'Nampula', -15.1167, 39.2667]
  );
  const locPickup = rLoc1.lastInsertRowId;

  const rLoc2 = db.runSync(
    `INSERT INTO locations (address_line, bairro, city, province, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Universidade', 'Namialo', 'Nampula', 'Nampula', -15.0833, 39.3]
  );
  const locDrop = rLoc2.lastInsertRowId;

  db.runSync(
    `INSERT INTO rides (
       ride_code, customer_user_id, pickup_location_id, dropoff_location_id,
       estimated_fare, status, requested_at
     ) VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'))`,
    ['DEMO-RIDE-001', userId, locPickup, locDrop, 150.0]
  );
}

/**
 * Insere 15 motoristas (utilizador + provider_driver + veículo) se ainda não existirem.
 * @param {import('expo-sqlite').SQLiteDatabase} db
 */
export function seedDriverFleetIfNeeded(db) {
  if (!DEMO_SEED_ENABLED) {
    return;
  }

  const check = db.getFirstSync(
    `SELECT COUNT(*) AS c FROM users WHERE phone >= '+258879991001' AND phone <= '+258879991015'`
  );
  if (Number(check?.c) >= 15) {
    return;
  }

  db.withTransactionSync(() => {
    for (const d of DRIVER_FLEET) {
      const exists = db.getFirstSync('SELECT id FROM users WHERE phone = ?', [d.phone]);
      if (exists) {
        continue;
      }

      const u = db.runSync(
        `INSERT INTO users (name, phone, email, password, status, is_admin)
         VALUES (?, ?, NULL, ?, 'active', 0)`,
        [d.name, d.phone, DEMO_PASSWORD_HASH]
      );
      const uid = u.lastInsertRowId;

      const p = db.runSync(
        `INSERT INTO provider_profiles (user_id, provider_type, document_number, license_number, availability_status, rating_avg)
         VALUES (?, 'driver', ?, ?, 'available', ?)`,
        [uid, d.doc, d.license, d.rating]
      );
      const profileId = p.lastInsertRowId;

      const v = d.vehicle;
      db.runSync(
        `INSERT INTO vehicles (provider_profile_id, vehicle_type, brand, model, plate_number, color, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [profileId, v.type, v.brand, v.model, v.plate, v.color]
      );
    }
  });
}
