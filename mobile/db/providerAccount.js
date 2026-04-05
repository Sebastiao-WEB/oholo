import { getAllSync, getFirstSync, getLocalDatabase, initLocalDatabase, runSync } from './database';

/**
 * @param {number} userId
 * @returns {Record<string, unknown> | null}
 */
export function getProviderProfileForUser(userId) {
  initLocalDatabase();
  return getFirstSync(
    `SELECT p.*, u.name AS user_name
     FROM provider_profiles p
     INNER JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ?`,
    [userId]
  );
}

/**
 * @param {number} userId
 * @param {'available'|'busy'|'offline'} status
 */
export function setProviderAvailabilityByUserId(userId, status) {
  initLocalDatabase();
  const r = runSync(
    `UPDATE provider_profiles SET availability_status = ?, updated_at = datetime('now') WHERE user_id = ?`,
    [status, userId]
  );
  return r.changes > 0;
}

/**
 * @param {number} userId
 */
export function listVehiclesForUser(userId) {
  initLocalDatabase();
  return getAllSync(
    `SELECT v.*
     FROM vehicles v
     INNER JOIN provider_profiles p ON p.id = v.provider_profile_id
     WHERE p.user_id = ?
     ORDER BY v.id ASC`,
    [userId]
  );
}

/**
 * @param {object} p
 * @param {number} p.userId
 * @param {'driver'|'courier'|'both'} p.providerType
 * @param {string} p.documentNumber
 * @param {string} [p.licenseNumber]
 * @param {'car'|'motorbike'|'van'} p.vehicleType
 * @param {string} p.brand
 * @param {string} p.model
 * @param {string} p.plateNumber
 * @param {string} p.color
 * @returns {{ ok: true, profileId: number, vehicleId: number } | { ok: false, error: string }}
 */
export function createProviderWithFirstVehicle(p) {
  initLocalDatabase();
  const db = getLocalDatabase();
  const userId = Number(p.userId);
  if (!Number.isFinite(userId)) {
    return { ok: false, error: 'invalid_user' };
  }

  const existing = getFirstSync('SELECT id FROM provider_profiles WHERE user_id = ?', [userId]);
  if (existing) {
    return { ok: false, error: 'already_provider' };
  }

  const plate = String(p.plateNumber || '').trim();
  if (!plate) {
    return { ok: false, error: 'invalid_plate' };
  }

  const plateTaken = getFirstSync('SELECT id FROM vehicles WHERE UPPER(plate_number) = UPPER(?)', [plate]);
  if (plateTaken) {
    return { ok: false, error: 'plate_taken' };
  }

  const doc = String(p.documentNumber || '').trim();
  if (!doc) {
    return { ok: false, error: 'invalid_document' };
  }

  let profileId = null;
  let vehicleId = null;
  try {
    db.withTransactionSync(() => {
      const insP = db.runSync(
        `INSERT INTO provider_profiles (user_id, provider_type, document_number, license_number, availability_status, rating_avg)
         VALUES (?, ?, ?, ?, 'offline', NULL)`,
        [
          userId,
          p.providerType,
          doc,
          p.licenseNumber != null && String(p.licenseNumber).trim() !== '' ? String(p.licenseNumber).trim() : null,
        ]
      );
      profileId = insP.lastInsertRowId;

      const insV = db.runSync(
        `INSERT INTO vehicles (provider_profile_id, vehicle_type, brand, model, plate_number, color, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [
          profileId,
          p.vehicleType,
          String(p.brand || '').trim(),
          String(p.model || '').trim(),
          plate,
          String(p.color || '').trim(),
        ]
      );
      vehicleId = insV.lastInsertRowId;
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'db_error' };
  }

  return { ok: true, profileId, vehicleId };
}

/**
 * @param {number} userId
 * @param {{ vehicleType: string, brand: string, model: string, plateNumber: string, color: string }} v
 * @returns {{ ok: true, vehicleId: number } | { ok: false, error: string }}
 */
export function addVehicleForUser(userId, v) {
  initLocalDatabase();
  const db = getLocalDatabase();
  const profile = getFirstSync('SELECT id FROM provider_profiles WHERE user_id = ?', [userId]);
  if (!profile?.id) {
    return { ok: false, error: 'no_profile' };
  }

  const plate = String(v.plateNumber || '').trim();
  if (!plate) {
    return { ok: false, error: 'invalid_plate' };
  }

  const plateTaken = getFirstSync('SELECT id FROM vehicles WHERE UPPER(plate_number) = UPPER(?)', [plate]);
  if (plateTaken) {
    return { ok: false, error: 'plate_taken' };
  }

  let vehicleId = null;
  try {
    const ins = db.runSync(
      `INSERT INTO vehicles (provider_profile_id, vehicle_type, brand, model, plate_number, color, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        profile.id,
        v.vehicleType,
        String(v.brand || '').trim(),
        String(v.model || '').trim(),
        plate,
        String(v.color || '').trim(),
      ]
    );
    vehicleId = ins.lastInsertRowId;
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'db_error' };
  }

  return { ok: true, vehicleId };
}

/**
 * @param {number} profileId
 * @param {string | null} uri
 */
export function setProviderDocumentPhotoUri(profileId, uri) {
  initLocalDatabase();
  const id = Number(profileId);
  if (!Number.isFinite(id)) {
    return false;
  }
  const r = runSync(
    `UPDATE provider_profiles SET document_photo_uri = ?, updated_at = datetime('now') WHERE id = ?`,
    [uri, id]
  );
  return r.changes > 0;
}

/**
 * @param {number} profileId
 * @param {string | null} uri
 */
export function setProviderLicensePhotoUri(profileId, uri) {
  initLocalDatabase();
  const id = Number(profileId);
  if (!Number.isFinite(id)) {
    return false;
  }
  const r = runSync(
    `UPDATE provider_profiles SET license_photo_uri = ?, updated_at = datetime('now') WHERE id = ?`,
    [uri, id]
  );
  return r.changes > 0;
}

/**
 * @param {number} vehicleId
 * @param {string | null} photoUri
 */
export function setVehiclePhotoUri(vehicleId, photoUri) {
  initLocalDatabase();
  const id = Number(vehicleId);
  if (!Number.isFinite(id)) {
    return false;
  }
  const r = runSync(`UPDATE vehicles SET photo_uri = ?, updated_at = datetime('now') WHERE id = ?`, [photoUri, id]);
  return r.changes > 0;
}

/**
 * @param {number} userId
 * @param {number} vehicleId
 * @param {'active'|'inactive'|'maintenance'} status
 */
export function setVehicleStatusForUser(userId, vehicleId, status) {
  initLocalDatabase();
  const uid = Number(userId);
  const vid = Number(vehicleId);
  if (!Number.isFinite(uid) || !Number.isFinite(vid)) {
    return false;
  }
  if (!['active', 'inactive', 'maintenance'].includes(status)) {
    return false;
  }
  const row = getFirstSync(
    `SELECT v.id FROM vehicles v
     INNER JOIN provider_profiles p ON p.id = v.provider_profile_id
     WHERE v.id = ? AND p.user_id = ?`,
    [vid, uid]
  );
  if (!row) {
    return false;
  }
  const r = runSync(`UPDATE vehicles SET status = ?, updated_at = datetime('now') WHERE id = ?`, [status, vid]);
  return r.changes > 0;
}
