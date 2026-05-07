import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import '../config/env.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const value = args[index + 1];

    if (!value || value.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = value;
    index += 1;
  }

  return options;
};

const printUsage = () => {
  console.log('Uso: npm run crear-admin -- --name "Admin" --email admin@demo.com --password "ClaveSegura123"');
};

const main = async () => {
  const args = parseArgs();
  const name = args.name?.trim();
  const email = args.email?.trim().toLowerCase();
  const password = args.password;

  if (!name || !email || !password) {
    printUsage();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.name = name;
      existingUser.role = 'admin';
      existingUser.password = await bcrypt.hash(password, 10);
      await existingUser.save();

      console.log(`Usuario actualizado como admin: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(`Admin creado correctamente: ${email}`);
  } catch (error) {
    console.error(`No se pudo crear el admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main();
