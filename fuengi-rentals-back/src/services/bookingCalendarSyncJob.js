import Apartment from '../models/Apartment.js';
import { syncBookingCalendar } from './bookingCalendarService.js';

const DEFAULT_SYNC_INTERVAL_MINUTES = 30;

const getSyncIntervalMinutes = () => {
  const configuredValue = Number(process.env.BOOKING_CALENDAR_SYNC_INTERVAL_MINUTES);

  if (Number.isNaN(configuredValue)) {
    return DEFAULT_SYNC_INTERVAL_MINUTES;
  }

  return configuredValue;
};

const syncConfiguredBookingCalendars = async () => {
  const apartments = await Apartment.find({
    bookingCalendarUrl: { $exists: true, $ne: '' },
  });

  for (const apartment of apartments) {
    try {
      await syncBookingCalendar(apartment);
      console.log(`Calendario Booking sincronizado: ${apartment.title}`);
    } catch (error) {
      console.error(`Error sincronizando Booking para ${apartment.title}: ${error.message}`);
    }
  }
};

export const startBookingCalendarSyncJob = () => {
  const intervalMinutes = getSyncIntervalMinutes();

  if (intervalMinutes <= 0) {
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  setTimeout(() => {
    syncConfiguredBookingCalendars().catch((error) => {
      console.error(`Error en sincronizacion de Booking: ${error.message}`);
    });
  }, 5000);

  setInterval(() => {
    syncConfiguredBookingCalendars().catch((error) => {
      console.error(`Error en sincronizacion de Booking: ${error.message}`);
    });
  }, intervalMs);
};
