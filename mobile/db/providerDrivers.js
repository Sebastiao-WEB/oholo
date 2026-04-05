import { getAllSync, initLocalDatabase } from './database';

/**
 * Posição estável junto ao ponto de recolha (a BD demo não guarda GPS dos motoristas).
 * @param {number} userId
 * @param {number} baseLat
 * @param {number} baseLon
 */
export function syntheticCoordinateNearPickup(userId, baseLat, baseLon) {
  const seed = (Number(userId) * 2654435761) >>> 0;
  const r1 = (seed & 0xffff) / 0xffff;
  const r2 = ((seed >>> 16) & 0xffff) / 0xffff;
  const dLat = (r1 - 0.5) * 0.024;
  const dLon = (r2 - 0.5) * 0.024;
  return { latitude: baseLat + dLat, longitude: baseLon + dLon };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Omit<MapDriver, 'latitude' | 'longitude'>}
 */
function mapSqlRow(row) {
  const brand = String(row.brand ?? '');
  const model = String(row.model ?? '');
  const color = String(row.color ?? '');
  const vehicleLine = [brand, model, color].filter(Boolean).join(' ').trim() || 'Veículo';

  return {
    userId: Number(row.user_id),
    name: String(row.user_name ?? '').trim() || 'Motorista',
    phone: String(row.user_phone ?? '').trim(),
    avatarUri: row.avatar_uri != null && String(row.avatar_uri).trim() !== '' ? String(row.avatar_uri).trim() : '',
    profileId: Number(row.profile_id),
    providerType: String(row.provider_type ?? ''),
    vehicleId: Number(row.vehicle_id),
    vehicleType: String(row.vehicle_type ?? 'car'),
    brand,
    model,
    plateNumber: String(row.plate_number ?? '').trim() || '—',
    color,
    vehicleLine,
  };
}

/**
 * @typedef {object} MapDriver
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} userId
 * @property {string} name
 * @property {string} phone
 * @property {string} avatarUri
 * @property {number} profileId
 * @property {string} providerType
 * @property {number} vehicleId
 * @property {string} vehicleType
 * @property {string} brand
 * @property {string} model
 * @property {string} plateNumber
 * @property {string} color
 * @property {string} vehicleLine
 */

/**
 * Motoristas/couriers disponíveis com veículo ativo, para mapa e atribuição.
 * @param {'ride' | 'delivery'} mode
 * @param {number} pickupLat
 * @param {number} pickupLon
 * @returns {MapDriver[]}
 */
export function listMapDrivers(mode, pickupLat, pickupLon) {
  initLocalDatabase();

  const typeFilter =
    mode === 'ride'
      ? "p.provider_type IN ('driver','both')"
      : "p.provider_type IN ('driver','courier','both')";

  const sql = `
    SELECT u.id AS user_id,
           u.name AS user_name,
           u.phone AS user_phone,
           u.avatar_uri,
           p.id AS profile_id,
           p.provider_type,
           v.id AS vehicle_id,
           v.vehicle_type,
           v.brand,
           v.model,
           v.plate_number,
           v.color
    FROM provider_profiles p
    INNER JOIN users u ON u.id = p.user_id
    INNER JOIN vehicles v ON v.provider_profile_id = p.id AND v.status = 'active'
    WHERE p.availability_status = 'available'
      AND ${typeFilter}
    ORDER BY u.id ASC
  `;

  const rows = getAllSync(sql, []);
  return rows.map((row) => {
    const base = mapSqlRow(row);
    const { latitude, longitude } = syntheticCoordinateNearPickup(base.userId, pickupLat, pickupLon);
    return { ...base, latitude, longitude };
  });
}

/**
 * @param {MapDriver[]} drivers
 * @param {number} pickupLat
 * @param {number} pickupLon
 * @returns {MapDriver | null}
 */
export function pickNearestMapDriver(drivers, pickupLat, pickupLon) {
  if (!drivers?.length) return null;
  const ref = { latitude: pickupLat, longitude: pickupLon };
  const dist = (a, b) => Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
  return drivers.reduce((best, cur) => (dist(cur, ref) < dist(best, ref) ? cur : best));
}

/**
 * Motorista atribuído ao acaso entre os candidatos (simula aceitação / matching, não só proximidade).
 * @param {MapDriver[]} drivers
 * @returns {MapDriver | null}
 */
export function pickRandomMapDriver(drivers) {
  if (!drivers?.length) return null;
  const i = Math.floor(Math.random() * drivers.length);
  return drivers[i];
}
