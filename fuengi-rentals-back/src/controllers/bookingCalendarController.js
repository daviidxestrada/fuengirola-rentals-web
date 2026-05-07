import Apartment from '../models/Apartment.js';
import {
  syncBookingCalendar,
  validateBookingCalendarUrl,
} from '../services/bookingCalendarService.js';

export const updateBookingCalendarSettings = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      const error = new Error('Apartamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    apartment.bookingCalendarUrl = validateBookingCalendarUrl(req.body?.bookingCalendarUrl);
    const updatedApartment = await apartment.save();

    res.json(updatedApartment);
  } catch (error) {
    next(error);
  }
};

export const syncApartmentBookingCalendar = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      const error = new Error('Apartamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const result = await syncBookingCalendar(apartment);

    res.json({
      importedCount: result.importedCount,
      syncedAt: result.syncedAt,
      apartment: result.apartment,
    });
  } catch (error) {
    next(error);
  }
};
