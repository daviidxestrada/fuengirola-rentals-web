import ical from 'node-ical';

import ExternalCalendarEvent from '../models/ExternalCalendarEvent.js';

const BOOKING_SOURCE = 'booking_ical';
const SYNC_TIMEOUT_MS = 12000;

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateKey = (date) =>
  [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('');

export const validateBookingCalendarUrl = (value) => {
  if (!value) {
    return '';
  }

  const trimmedUrl = String(value).trim();

  if (!isValidHttpUrl(trimmedUrl)) {
    const error = new Error('La URL iCal de Booking debe empezar por http:// o https://');
    error.statusCode = 400;
    throw error;
  }

  return trimmedUrl;
};

export const syncBookingCalendar = async (apartment) => {
  const bookingCalendarUrl = validateBookingCalendarUrl(apartment.bookingCalendarUrl);

  if (!bookingCalendarUrl) {
    const error = new Error('Configura primero la URL iCal de Booking.');
    error.statusCode = 400;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
  const syncedAt = new Date();

  try {
    const parsedCalendar = await ical.async.fromURL(bookingCalendarUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DirectBookingCalendarSync/1.0',
      },
    });

    const events = Object.values(parsedCalendar)
      .filter((entry) => entry.type === 'VEVENT')
      .map((entry, index) => {
        const startDate = toDate(entry.start);
        const endDate = toDate(entry.end);

        if (!startDate || !endDate || startDate >= endDate) {
          return null;
        }

        const fallbackId = `${toDateKey(startDate)}-${toDateKey(endDate)}-${index}`;

        return {
          apartment: apartment._id,
          source: BOOKING_SOURCE,
          externalId: String(entry.uid || fallbackId),
          title: entry.summary || 'Reserva Booking.com',
          startDate,
          endDate,
          lastSyncedAt: syncedAt,
        };
      })
      .filter(Boolean);

    const externalIds = events.map((event) => event.externalId);

    await Promise.all(
      events.map((event) =>
        ExternalCalendarEvent.updateOne(
          {
            apartment: apartment._id,
            source: BOOKING_SOURCE,
            externalId: event.externalId,
          },
          { $set: event },
          { upsert: true }
        )
      )
    );

    await ExternalCalendarEvent.deleteMany({
      apartment: apartment._id,
      source: BOOKING_SOURCE,
      externalId: { $nin: externalIds },
    });

    apartment.lastBookingCalendarSyncAt = syncedAt;
    apartment.lastBookingCalendarSyncStatus = 'success';
    apartment.lastBookingCalendarSyncMessage = 'Calendario Booking sincronizado correctamente.';
    apartment.lastBookingCalendarImportedCount = events.length;
    await apartment.save();

    return {
      importedCount: events.length,
      syncedAt,
      apartment,
    };
  } catch (error) {
    apartment.lastBookingCalendarSyncAt = syncedAt;
    apartment.lastBookingCalendarSyncStatus = 'error';
    apartment.lastBookingCalendarSyncMessage =
      error.name === 'AbortError'
        ? 'La sincronizacion con Booking ha tardado demasiado.'
        : error.message;
    await apartment.save();

    const syncError = new Error(apartment.lastBookingCalendarSyncMessage);
    syncError.statusCode = 502;
    throw syncError;
  } finally {
    clearTimeout(timeout);
  }
};

export const findBookingCalendarConflict = async (apartmentId, startDate, endDate) =>
  ExternalCalendarEvent.findOne({
    apartment: apartmentId,
    source: BOOKING_SOURCE,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  });

export const getBookingUnavailableRanges = async (apartmentId) => {
  const events = await ExternalCalendarEvent.find({
    apartment: apartmentId,
    source: BOOKING_SOURCE,
  })
    .sort({ startDate: 1 })
    .select('startDate endDate title source externalId lastSyncedAt');

  return events.map((event) => ({
    ...event.toObject(),
    source: 'booking_calendar',
    sourceName: 'Booking.com',
  }));
};
