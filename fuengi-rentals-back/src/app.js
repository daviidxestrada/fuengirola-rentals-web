import cors from 'cors';
import express from 'express';

import './config/env.js';
import errorHandler from './middlewares/errorMiddleware.js';
import apartmentRoutes from './routes/apartmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import blockRoutes from './routes/blockRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error('Origen no permitido por CORS');
    error.statusCode = 403;
    return callback(error);
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.use('/api/apartments', apartmentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blocks', blockRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.use(errorHandler);

export default app;
