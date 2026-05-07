import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Normaliza strings antes de validar o consultar la base de datos.
const normalizeCredentials = ({ name, email, password } = {}) => ({
  name: typeof name === 'string' ? name.trim() : '',
  email: typeof email === 'string' ? email.trim().toLowerCase() : '',
  password: typeof password === 'string' ? password : '',
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = normalizeCredentials(req.body);

    if (!name || !email || !password) {
      throw createError('Nombre, email y contrasena son obligatorios', 400);
    }

    if (name.length < 2) {
      throw createError('El nombre debe tener al menos 2 caracteres', 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw createError('El email no es valido', 400);
    }

    if (password.length < 6) {
      throw createError('La contrasena debe tener al menos 6 caracteres', 400);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw createError('El usuario ya existe', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Usuario creado',
      user: buildAuthUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = normalizeCredentials(req.body);

    if (!email || !password) {
      throw createError('Email y contrasena son obligatorios', 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw createError('El email no es valido', 400);
    }

    if (!process.env.JWT_SECRET) {
      throw createError('Falta la configuracion de JWT_SECRET', 500);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw createError('Credenciales incorrectas', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw createError('Credenciales incorrectas', 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: buildAuthUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  return res.json({
    user: buildAuthUser(req.user),
  });
};
