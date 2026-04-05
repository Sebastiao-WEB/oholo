import { getAllSync, getFirstSync, initLocalDatabase } from './database';
import { mapRideRowToActivity } from './rideActivities';

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

function deliveryStatusUi(dbStatus) {
  switch (dbStatus) {
    case 'delivered':
      return { status: 'completed', statusLabel: 'Entregue' };
    case 'cancelled':
      return { status: 'cancelled', statusLabel: 'Cancelada' };
    case 'in_transit':
      return { status: 'active', statusLabel: 'Em trânsito' };
    case 'picked_up':
      return { status: 'active', statusLabel: 'Recolhido' };
    case 'accepted':
      return { status: 'active', statusLabel: 'Aceite' };
    default:
      return { status: 'active', statusLabel: 'Pedido' };
  }
}

function ticketStatusUi(s) {
  switch (s) {
    case 'paid':
      return { status: 'completed', statusLabel: 'Pago' };
    case 'used':
      return { status: 'completed', statusLabel: 'Utilizado' };
    case 'cancelled':
      return { status: 'cancelled', statusLabel: 'Cancelado' };
    default:
      return { status: 'active', statusLabel: 'Pendente' };
  }
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapDeliveryRowToActivity(row) {
  const pickup = String(row.pickup_address ?? '').trim();
  const drop = String(row.dropoff_address ?? '').trim();
  const at = row.delivered_at || row.cancelled_at || row.requested_at;
  const { date, time } = formatPtDateTime(at);
  const ui = deliveryStatusUi(String(row.status || 'requested'));
  const desc = String(row.item_description || '').trim();
  const shortDesc = desc.length > 40 ? `${desc.slice(0, 38)}…` : desc;
  return {
    id: `delivery-${row.id}`,
    type: 'delivery',
    title: shortDesc ? `Delivery — ${shortDesc}` : 'Delivery',
    subtitle: pickup && drop ? `${pickup} → ${drop}` : pickup || drop || desc,
    date,
    time,
    status: ui.status,
    statusLabel: ui.statusLabel,
    amount:
      row.delivery_fee != null && Number.isFinite(Number(row.delivery_fee))
        ? `${Math.round(Number(row.delivery_fee))} MT`
        : null,
    paymentMethod: null,
    pickupName: pickup,
    destinationName: drop,
    itemDescription: desc,
    deliveryCode: row.delivery_code ? String(row.delivery_code) : null,
    cancellationReason: row.cancellation_reason ? String(row.cancellation_reason) : null,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapTicketRowToActivity(row) {
  const origin = String(row.origin_city || 'Origem');
  const dest = String(row.destination_city || 'Destino');
  const { date, time } = formatPtDateTime(row.booked_at);
  const ui = ticketStatusUi(String(row.status || 'pending'));
  const dep = row.departure_datetime ? String(row.departure_datetime) : '';
  return {
    id: `ticket-${row.id}`,
    type: 'ticket',
    title: `Bilhete ${origin} → ${dest}`,
    subtitle: dep ? `Partida: ${dep}` : `Ref. ${row.booking_code || ''}`,
    date,
    time,
    status: ui.status,
    statusLabel: ui.statusLabel,
    amount: row.amount != null && Number.isFinite(Number(row.amount)) ? `${Math.round(Number(row.amount))} MT` : null,
    paymentMethod: null,
    bookingCode: row.booking_code ? String(row.booking_code) : null,
    passengerName: row.passenger_name ? String(row.passenger_name) : null,
    passengerPhone: row.passenger_phone ? String(row.passenger_phone) : null,
  };
}

/**
 * Todas as atividades do utilizador (corridas, delivery, bilhetes), mais recentes primeiro.
 * @param {number} customerUserId
 */
export function listAllActivitiesForUser(customerUserId) {
  initLocalDatabase();

  const rideRows = getAllSync(
    `SELECT r.id, r.ride_code, r.estimated_fare, r.final_fare, r.status, r.requested_at, r.completed_at,
            r.cancelled_at, r.cancellation_reason,
            r.payment_method, r.ride_type, r.route_distance_km, r.duration_minutes,
            pl.address_line AS pickup_address, dl.address_line AS dropoff_address,
            datetime(COALESCE(r.completed_at, r.cancelled_at, r.requested_at, r.created_at)) AS sort_ts
     FROM rides r
     JOIN locations pl ON pl.id = r.pickup_location_id
     JOIN locations dl ON dl.id = r.dropoff_location_id
     WHERE r.customer_user_id = ?
     ORDER BY sort_ts DESC
     LIMIT 100`,
    [customerUserId]
  );

  const deliveryRows = getAllSync(
    `SELECT d.id, d.delivery_code, d.item_description, d.delivery_fee, d.status, d.requested_at,
            d.delivered_at, d.cancelled_at, d.cancellation_reason,
            pl.address_line AS pickup_address, dl.address_line AS dropoff_address,
            datetime(COALESCE(d.delivered_at, d.cancelled_at, d.requested_at, d.created_at)) AS sort_ts
     FROM deliveries d
     JOIN locations pl ON pl.id = d.pickup_location_id
     JOIN locations dl ON dl.id = d.dropoff_location_id
     WHERE d.customer_user_id = ?
     ORDER BY sort_ts DESC
     LIMIT 100`,
    [customerUserId]
  );

  const ticketRows = getAllSync(
    `SELECT tb.id, tb.booking_code, tb.amount, tb.status, tb.booked_at,
            tb.passenger_name, tb.passenger_phone,
            r.origin_city, r.destination_city, ts.departure_datetime,
            datetime(tb.booked_at) AS sort_ts
     FROM ticket_bookings tb
     LEFT JOIN trip_schedules ts ON ts.id = tb.trip_schedule_id
     LEFT JOIN routes r ON r.id = ts.route_id
     WHERE tb.user_id = ?
     ORDER BY sort_ts DESC
     LIMIT 100`,
    [customerUserId]
  );

  const merged = [
    ...rideRows.map((row) => ({
      ...mapRideRowToActivity(row),
      _sortTs: String(row.sort_ts || ''),
    })),
    ...deliveryRows.map((row) => ({
      ...mapDeliveryRowToActivity(row),
      _sortTs: String(row.sort_ts || ''),
    })),
    ...ticketRows.map((row) => ({
      ...mapTicketRowToActivity(row),
      _sortTs: String(row.sort_ts || ''),
    })),
  ];

  merged.sort((a, b) => b._sortTs.localeCompare(a._sortTs));
  return merged.map(({ _sortTs, ...act }) => act);
}

/**
 * @param {number} deliveryId
 * @param {number} customerUserId
 */
export function loadDeliveryAsActivity(deliveryId, customerUserId) {
  initLocalDatabase();
  const row = getFirstSync(
    `SELECT d.id, d.delivery_code, d.item_description, d.delivery_fee, d.status, d.requested_at,
            d.delivered_at, d.cancelled_at, d.cancellation_reason,
            pl.address_line AS pickup_address, dl.address_line AS dropoff_address
     FROM deliveries d
     JOIN locations pl ON pl.id = d.pickup_location_id
     JOIN locations dl ON dl.id = d.dropoff_location_id
     WHERE d.id = ? AND d.customer_user_id = ?`,
    [deliveryId, customerUserId]
  );
  return row ? mapDeliveryRowToActivity(row) : null;
}

/**
 * @param {number} ticketId
 * @param {number} userId
 */
export function loadTicketAsActivity(ticketId, userId) {
  initLocalDatabase();
  const row = getFirstSync(
    `SELECT tb.id, tb.booking_code, tb.amount, tb.status, tb.booked_at,
            tb.passenger_name, tb.passenger_phone,
            r.origin_city, r.destination_city, ts.departure_datetime
     FROM ticket_bookings tb
     LEFT JOIN trip_schedules ts ON ts.id = tb.trip_schedule_id
     LEFT JOIN routes r ON r.id = ts.route_id
     WHERE tb.id = ? AND tb.user_id = ?`,
    [ticketId, userId]
  );
  return row ? mapTicketRowToActivity(row) : null;
}
