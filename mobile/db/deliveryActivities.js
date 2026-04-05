import { getFirstSync, getLocalDatabase, initLocalDatabase } from './database';

/**
 * @param {'delivered' | 'cancelled'} status
 */
export function insertDeliveryRecord({
  customerUserId,
  courierUserId,
  deliveryCode,
  pickupAddress,
  dropoffAddress,
  pickupLat,
  pickupLon,
  dropoffLat,
  dropoffLon,
  itemDescription,
  deliveryFee,
  status,
  cancellationReason,
}) {
  initLocalDatabase();
  const code = String(deliveryCode || '').trim();
  if (!code || customerUserId == null) {
    return null;
  }

  const existing = getFirstSync('SELECT id FROM deliveries WHERE delivery_code = ?', [code]);
  if (existing?.id != null) {
    return Number(existing.id);
  }

  const st = status === 'cancelled' ? 'cancelled' : 'delivered';
  const db = getLocalDatabase();
  let deliveryId = null;

  db.withTransactionSync(() => {
    const pLat = Number.isFinite(Number(pickupLat)) ? Number(pickupLat) : -15.1165;
    const pLon = Number.isFinite(Number(pickupLon)) ? Number(pickupLon) : 39.2666;
    const dLat = Number.isFinite(Number(dropoffLat)) ? Number(dropoffLat) : pLat;
    const dLon = Number.isFinite(Number(dropoffLon)) ? Number(dropoffLon) : pLon;

    const pickupRes = db.runSync(
      `INSERT INTO locations (address_line, bairro, city, province, latitude, longitude)
       VALUES (?, NULL, 'Nampula', 'Nampula', ?, ?)`,
      [String(pickupAddress || 'Recolha'), pLat, pLon]
    );
    const pickupLocId = pickupRes.lastInsertRowId;

    const dropRes = db.runSync(
      `INSERT INTO locations (address_line, bairro, city, province, latitude, longitude)
       VALUES (?, NULL, 'Nampula', 'Nampula', ?, ?)`,
      [String(dropoffAddress || 'Entrega'), dLat, dLon]
    );
    const dropLocId = dropRes.lastInsertRowId;

    const now = new Date().toISOString();
    const fee = Number(deliveryFee);
    const courierId =
      courierUserId != null && Number.isFinite(Number(courierUserId)) ? Number(courierUserId) : null;
    const ins = db.runSync(
      `INSERT INTO deliveries (
        delivery_code, customer_user_id, courier_user_id, vehicle_id,
        pickup_location_id, dropoff_location_id, item_description, delivery_fee,
        status, requested_at, delivered_at, cancelled_at, cancellation_reason, updated_at
      ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        code,
        customerUserId,
        courierId,
        pickupLocId,
        dropLocId,
        String(itemDescription || 'Delivery'),
        Number.isFinite(fee) ? fee : 0,
        st,
        now,
        st === 'delivered' ? now : null,
        st === 'cancelled' ? now : null,
        st === 'cancelled' ? String(cancellationReason || 'Cancelado pelo cliente') : null,
      ]
    );
    deliveryId = ins.lastInsertRowId;
  });

  return deliveryId;
}

export function insertDeliveredDelivery(params) {
  return insertDeliveryRecord({ ...params, status: 'delivered' });
}

export function insertCancelledDelivery(params) {
  return insertDeliveryRecord({ ...params, status: 'cancelled', cancellationReason: params.cancellationReason });
}
