import jwt from 'jsonwebtoken';

import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Falta la configuracion de autenticacion' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado, token requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'No autorizado, usuario no valido' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado, token invalido' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, solo admin' });
  }

  return next();
};
