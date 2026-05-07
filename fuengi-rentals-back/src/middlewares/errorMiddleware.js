import mongoose from 'mongoose';

// Convierte errores tecnicos frecuentes en respuestas HTTP consistentes.
const getErrorResponse = (err) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return {
      statusCode: 400,
      message: 'El cuerpo JSON no es valido',
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: 'Los datos enviados no son validos',
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      message: 'El identificador enviado no es valido',
    };
  }

  if (err?.code === 11000) {
    return {
      statusCode: 409,
      message: 'Ya existe un registro con esos datos',
    };
  }

  if (err?.statusCode) {
    return {
      statusCode: err.statusCode,
      message: err.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Error interno del servidor',
  };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = getErrorResponse(err);

  console.error(err.stack || err.message);

  res.status(statusCode).json({ message });
};

export default errorHandler;
