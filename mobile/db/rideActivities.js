import { getAllSync, getFirstSync, getLocalDatabase, initLocalDatabase } from './database';

function formatPtDateTime(value) {
  if (!value) {
    return { date: '—', time: '—' };
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { date: String(value).slice(0, 10), time: '—' };
  }
  return {
    date: d.toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
  };
}

function titleFromDestination(dropoff) {
  const t = String(dropoff || '').trim();
  if (!t) return 'Corrida';
  const short = t.length > 42 ? `${t.slice(0, 40)}…` : t;
  return `Corrida — ${short}`;
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapRideRowToActivity(row) {
  const pickup = String(row.pickup_address ?? '').trim();
  const drop = String(row.dropoff_address ?? '').trim();
  const displayAt = row.completed_at || row.cancelled_at || row.requested_at;
  const { date, time } = formatPtDateTime(displayAt);
  const stDb = String(row.status || 'completed');
  const fare = stDb === 'cancelled' ? row.estimated_fare : row.final_fare ?? row.estimated_fare;
  const distKm = row.route_distance_km;
  const distStr =
    distKm != null && Number.isFinite(Number(distKm))
      ? `${Number(distKm).toFixed(1).replace('.', ',')} km`
      : null;
  const durMin = row.duration_minutes;
  const durStr = durMin != null && Number.isFinite(Number(durMin)) ? `${Math.round(Number(durMin))} min` : null;
  const st = stDb;
  return {
    id: `ride-${row.id}`,
    type: 'ride',
    title: titleFromDestination(drop),
    subtitle: pickup && drop ? `${pickup} → ${drop}` : pickup || drop || 'Corrida',
    date,
    time,
    status: st === 'cancelled' ? 'cancelled' : 'completed',
    statusLabel: st === 'cancelled' ? 'Cancelada' : 'Concluída',
    amount: fare != null && Number.isFinite(Number(fare)) ? `${Math.round(Number(fare))} MT` : null,
    paymentMethod: row.payment_method ? String(row.payment_method) : null,
    rideType: row.ride_type ? String(row.ride_type) : null,
    distanceKm: distStr,
    durationMin: durStr,
    rideCode: row.ride_code ? String(row.ride_code) : null,
    pickupName: pickup,
    destinationName: drop,
    cancellationReason: row.cancellation_reason ? String(row.cancellation_reason) : null,
  };
}

/**
 * @param {number} customerUserId
 */
export function listRideActivitiesForUser(customerUserId) {
  initLocalDatabase();
  const rows = getAllSync(
    `SELECT r.id, r.ride_code, r.estimated_fare, r.final_fare, r.status, r.requested_at, r.completed_at,
            r.cancelled_at, r.cancellation_reason,
            r.payment_method, r.ride_type, r.route_distance_km, r.duration_minutes,
            pl.address_line AS pickup_address, dl.address_line AS dropoff_address
     FROM rides r
     JOIN locations pl ON pl.id = r.pickup_location_id
     JOIN locations dl ON dl.id = r.dropoff_location_id
     WHERE r.customer_user_id = ?
     ORDER BY datetime(COALESCE(r.completed_at, r.cancelled_at, r.requested_at, r.created_at)) DESC
     LIMIT 100`,
    [customerUserId]
  );
  return rows.map((row) => mapRideRowToActivity(row));
}

/**
 * @param {number} rideId
 * @param {number} customerUserId
 */
export function loadRideAsActivity(rideId, customerUserId) {
  initLocalDatabase();
  const row = getFirstSync(
    `SELECT r.id, r.ride_code, r.estimated_fare, r.final_fare, r.status, r.requested_at, r.completed_at,
            r.cancelled_at, r.cancellation_reason,
            r.payment_method, r.ride_type, r.route_distance_km, r.duration_minutes,
            pl.address_line AS pickup_address, dl.address_line AS dropoff_address
     FROM rides r
     JOIN locations pl ON pl.id = r.pickup_location_id
     JOIN locations dl ON dl.id = r.dropoff_location_id
     WHERE r.id = ? AND r.customer_user_id = ?`,
    [rideId, customerUserId]
  );
  if (!row) {
    return null;
  }
  return mapRideRowToActivity(row);
}

/**
 * Grava corrida concluída ou cancelada. Idempotente por `ride_code`.
 * @param {'completed' | 'cancelled'} params.status
 * @returns {number|null}
 */
export function insertRideRecord({
  customerUserId,
  rideCode,
  pickupAddress,
  dropoffAddress,
  pickupLat,
  pickupLon,
  dropoffLat,
  dropoffLon,
  estimatedFare,
  finalFare,
  paymentMethod,
  rideType,
  routeDistanceKm,
  durationMinutes,
  status = 'completed',
  cancellationReason,
}) {
  initLocalDatabase();
  const code = String(rideCode || '').trim();
  if (!code || customerUserId == null) {
    return null;
  }

  const existing = getFirstSync('SELECT id FROM rides WHERE ride_code = ?', [code]);
  if (existing?.id != null) {
    return Number(existing.id);
  }

  const st = status === 'cancelled' ? 'cancelled' : 'completed';
  const db = getLocalDatabase();
  let rideId = null;

  db.withTransactionSync(() => {
    const pLat = Number.isFinite(Number(pickupLat)) ? Number(pickupLat) : -15.1165;
    const pLon = Number.isFinite(Number(pickupLon)) ? Number(pickupLon) : 39.2666;
    const dLat = Number.isFinite(Number(dropoffLat)) ? Number(dropoffLat) : pLat;
    const dLon = Number.isFinite(Number(dropoffLon)) ? Number(dropoffLon) : pLon;

    const pickupRes = db.runSync(
      `INSERT INTO locations (address_line, bairro, city, province, latitude, longitude)
       VALUES (?, NULL, 'Nampula', 'Nampula', ?, ?)`,
      [String(pickupAddress || 'Origem'), pLat, pLon]
    );
    const pickupLocId = pickupRes.lastInsertRowId;

    const dropRes = db.runSync(
      `INSERT INTO locations (address_line, bairro, city, province, latitude, longitude)
       VALUES (?, NULL, 'Nampula', 'Nampula', ?, ?)`,
      [String(dropoffAddress || 'Destino'), dLat, dLon]
    );
    const dropLocId = dropRes.lastInsertRowId;

    const now = new Date().toISOString();
    const est = Number(estimatedFare);
    const fin = finalFare != null ? Number(finalFare) : est;
    const dist = routeDistanceKm != null ? Number(routeDistanceKm) : null;
    const dur = durationMinutes != null ? Math.round(Number(durationMinutes)) : null;

    const ins = db.runSync(
      `INSERT INTO rides (
        ride_code, customer_user_id, pickup_location_id, dropoff_location_id,
        estimated_fare, final_fare, status, requested_at, completed_at, cancelled_at, cancellation_reason,
        payment_method, ride_type, route_distance_km, duration_minutes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        code,
        customerUserId,
        pickupLocId,
        dropLocId,
        Number.isFinite(est) ? est : 0,
        st === 'completed' && Number.isFinite(fin) ? fin : null,
        st,
        now,
        st === 'completed' ? now : null,
        st === 'cancelled' ? now : null,
        st === 'cancelled' ? String(cancellationReason || 'Cancelado pelo cliente') : null,
        paymentMethod ? String(paymentMethod) : null,
        rideType ? String(rideType) : null,
        st === 'completed' && Number.isFinite(dist) ? dist : null,
        st === 'completed' && dur != null && Number.isFinite(dur) ? dur : null,
      ]
    );
    rideId = ins.lastInsertRowId;
  });

  return rideId;
}

export function insertCompletedRide(params) {
  return insertRideRecord({ ...params, status: 'completed' });
}

export function insertCancelledRide(params) {
  return insertRideRecord({
    ...params,
    status: 'cancelled',
    cancellationReason: params.cancellationReason,
    finalFare: params.finalFare ?? null,
  });
}
