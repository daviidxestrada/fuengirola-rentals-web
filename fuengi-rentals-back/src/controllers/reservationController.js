import Apartment from '../models/Apartment.js';
import DateBlock from '../models/DateBlock.js';
import Reservation from '../models/Reservation.js';
import {
  findBookingCalendarConflict,
  getBookingUnavailableRanges,
} from '../services/bookingCalendarService.js';

const ACTIVE_RESERVATION_STATUSES = ['pending', 'approved'];

const hasDateOverlap = (startDate, endDate, existingReservation) =>
  startDate < existingReservation.endDate && endDate > existingReservation.startDate;

const findReservationConflict = async (apartmentId, startDate, endDate) =>
  Reservation.findOne({
    apartment: apartmentId,
    status: { $in: ACTIVE_RESERVATION_STATUSES },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  });

const findBlockConflict = async (apartmentId, startDate, endDate) =>
  DateBlock.findOne({
    apartment: apartmentId,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  });

export const getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('apartment')
      .populate('user', 'name email');
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('apartment')
      .sort({ startDate: -1 });

    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('apartment')
      .populate('user', 'name email');

    if (!reservation) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

export const getApartmentAvailability = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.apartmentId);

    if (!apartment) {
      const error = new Error('Apartamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const reservations = await Reservation.find({
      apartment: apartment._id,
      status: { $in: ACTIVE_RESERVATION_STATUSES },
    })
      .sort({ startDate: 1 })
      .select('startDate endDate status');
    const blocks = await DateBlock.find({ apartment: apartment._id })
      .sort({ startDate: 1 })
      .select('startDate endDate note');
    const bookingRanges = await getBookingUnavailableRanges(apartment._id);

    const unavailableRanges = [
      ...reservations.map((reservation) => ({
        ...reservation.toObject(),
        source: 'reservation',
        sourceName: 'Reserva web',
      })),
      ...blocks.map((block) => ({
        ...block.toObject(),
        source: 'block',
        sourceName: 'Bloqueo manual',
      })),
      ...bookingRanges,
    ].sort((firstRange, secondRange) => firstRange.startDate - secondRange.startDate);

    res.json({
      apartmentId: apartment._id,
      unavailableRanges,
    });
  } catch (error) {
    next(error);
  }
};

export const createReservation = async (req, res, next) => {
  try {
    const { apartment, startDate, endDate } = req.body;

    if (!apartment || !startDate || !endDate) {
      const error = new Error('Todos los campos son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const apartmentDoc = await Apartment.findById(apartment);

    if (!apartmentDoc) {
      const error = new Error('Apartamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
      const error = new Error('Las fechas no son validas');
      error.statusCode = 400;
      throw error;
    }

    if (parsedStartDate >= parsedEndDate) {
      const error = new Error('La fecha de fin debe ser posterior a la de inicio');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedStartDate < today) {
      const error = new Error('La fecha de inicio no puede ser anterior a hoy');
      error.statusCode = 400;
      throw error;
    }

    const conflictingReservation = await findReservationConflict(
      apartment,
      parsedStartDate,
      parsedEndDate
    );

    if (
      conflictingReservation &&
      hasDateOverlap(parsedStartDate, parsedEndDate, conflictingReservation)
    ) {
      const error = new Error('Las fechas seleccionadas no estan disponibles');
      error.statusCode = 409;
      throw error;
    }

    const conflictingBlock = await findBlockConflict(apartment, parsedStartDate, parsedEndDate);

    if (conflictingBlock) {
      const error = new Error('Las fechas seleccionadas estan bloqueadas manualmente');
      error.statusCode = 409;
      throw error;
    }

    const conflictingBookingEvent = await findBookingCalendarConflict(
      apartment,
      parsedStartDate,
      parsedEndDate
    );

    if (conflictingBookingEvent) {
      const error = new Error('Las fechas seleccionadas estan ocupadas en Booking.com');
      error.statusCode = 409;
      throw error;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const totalNights = Math.ceil((parsedEndDate - parsedStartDate) / millisecondsPerDay);
    const totalPrice = totalNights * apartmentDoc.price;

    const reservation = new Reservation({
      user: req.user._id,
      apartment,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      totalPrice,
      status: 'pending',
    });

    const savedReservation = await reservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate('apartment')
      .populate('user', 'name email');

    if (!reservation) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (!['approved', 'rejected'].includes(status)) {
      const error = new Error('Estado de reserva no valido');
      error.statusCode = 400;
      throw error;
    }

    if (status === 'rejected' && !rejectionReason?.trim()) {
      const error = new Error('Debes indicar un motivo al denegar la solicitud');
      error.statusCode = 400;
      throw error;
    }

    if (status === 'approved') {
      const conflictingBookingEvent = await findBookingCalendarConflict(
        reservation.apartment._id,
        reservation.startDate,
        reservation.endDate
      );

      if (conflictingBookingEvent) {
        const error = new Error('No se puede aprobar: esas fechas figuran ocupadas en Booking.com');
        error.statusCode = 409;
        throw error;
      }
    }

    reservation.status = status;
    reservation.rejectionReason = status === 'rejected' ? rejectionReason.trim() : '';

    await reservation.save();

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

export const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await reservation.deleteOne();
    res.json({ message: 'Reserva eliminada' });
  } catch (error) {
    next(error);
  }
};
