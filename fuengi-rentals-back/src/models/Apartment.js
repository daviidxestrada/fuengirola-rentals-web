import mongoose from 'mongoose';

const apartmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    bookingCalendarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    lastBookingCalendarSyncAt: {
      type: Date,
    },
    lastBookingCalendarSyncStatus: {
      type: String,
      enum: ['idle', 'success', 'error'],
      default: 'idle',
    },
    lastBookingCalendarSyncMessage: {
      type: String,
      trim: true,
      default: '',
    },
    lastBookingCalendarImportedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Apartment', apartmentSchema);
