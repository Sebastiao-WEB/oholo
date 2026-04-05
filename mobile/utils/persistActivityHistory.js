import { initLocalDatabase, insertCancelledDelivery, insertCancelledRide } from '../db';

import { getSessionUserId } from './session';

function parseFee(value) {
  const n = Number.parseFloat(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function parseCoord(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Grava corrida cancelada no SQLite (histórico). Idempotente por `rideCode`.
 * @param {Record<string, string | undefined>} params — params do expo-router
 */
export async function persistCancelledRideFromParams(params) {
  const rideCode = String(params.rideCode || '').trim();
  if (!rideCode) {
    return;
  }
  try {
    const userId = await getSessionUserId();
    if (userId == null) {
      return;
    }
    initLocalDatabase();
    const est = parseFee(params.estimatedPrice);
    const dist = parseFee(params.distanceKm);
    insertCancelledRide({
      customerUserId: userId,
      rideCode,
      pickupAddress: String(params.pickupName || 'Origem'),
      dropoffAddress: String(params.destinationName || 'Destino'),
      pickupLat: parseCoord(params.pickupLat, -15.1165),
      pickupLon: parseCoord(params.pickupLon, 39.2666),
      dropoffLat: parseCoord(params.destinationLat, -15.11),
      dropoffLon: parseCoord(params.destinationLon, 39.28),
      estimatedFare: est,
      finalFare: null,
      paymentMethod: String(params.paymentMethod || ''),
      rideType: String(params.rideType || ''),
      routeDistanceKm: dist > 0 ? dist : null,
      durationMinutes: null,
      cancellationReason: 'Cancelado pelo cliente',
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * Grava delivery cancelado no SQLite (histórico). Idempotente por `deliveryCode`.
 * @param {Record<string, string | undefined>} params
 */
export async function persistCancelledDeliveryFromParams(params) {
  const deliveryCode = String(params.deliveryCode || '').trim();
  if (!deliveryCode) {
    return;
  }
  try {
    const userId = await getSessionUserId();
    if (userId == null) {
      return;
    }
    initLocalDatabase();
    insertCancelledDelivery({
      customerUserId: userId,
      deliveryCode,
      pickupAddress: String(params.pickupName || 'Recolha'),
      dropoffAddress: String(params.destinationName || 'Entrega'),
      pickupLat: parseCoord(params.pickupLat, -15.1165),
      pickupLon: parseCoord(params.pickupLon, 39.2666),
      dropoffLat: parseCoord(params.destinationLat, -15.11),
      dropoffLon: parseCoord(params.destinationLon, 39.28),
      itemDescription: String(params.itemDescription || 'Delivery'),
      deliveryFee: parseFee(params.deliveryFee || params.estimatedPrice),
      cancellationReason: 'Cancelado pelo cliente',
    });
  } catch (e) {
    console.error(e);
  }
}
