import './config/env.js';

import app from './app.js';
import connectDB from './config/db.js';
import { startBookingCalendarSyncJob } from './services/bookingCalendarSyncJob.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      startBookingCalendarSyncJob();
    });
  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
