import mongoose from 'mongoose';

const externalCalendarEventSchema = new mongoose.Schema(
  {
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['booking_ical'],
      default: 'booking_ical',
      required: true,
    },
    externalId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Reserva Booking.com',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    lastSyncedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

externalCalendarEventSchema.index(
  { apartment: 1, source: 1, externalId: 1 },
  { unique: true }
);

export default mongoose.model('ExternalCalendarEvent', externalCalendarEventSchema);
