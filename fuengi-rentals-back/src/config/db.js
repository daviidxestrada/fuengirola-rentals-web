import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    const error = new Error('Falta la variable de entorno MONGO_URI');
    error.statusCode = 500;
    throw error;
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB conectado: ${conn.connection.host}`);
  return conn;
};

export default connectDB;
