import express from 'express';

import { adminOnly, protect } from '../middlewares/authMiddleware.js';
import {
  createApartment,
  deleteApartment,
  getAdminApartments,
  getApartmentById,
  getApartments,
  updateApartment,
} from '../controllers/apartmentController.js';
import {
  syncApartmentBookingCalendar,
  updateBookingCalendarSettings,
} from '../controllers/bookingCalendarController.js';

const router = express.Router();

router.get('/', getApartments);
router.get('/admin/list', protect, adminOnly, getAdminApartments);
router.patch('/:id/booking-calendar', protect, adminOnly, updateBookingCalendarSettings);
router.post('/:id/booking-calendar/sync', protect, adminOnly, syncApartmentBookingCalendar);
router.get('/:id', getApartmentById);
router.post('/', protect, adminOnly, createApartment);
router.put('/:id', protect, adminOnly, updateApartment);
router.delete('/:id', protect, adminOnly, deleteApartment);

export default router;
