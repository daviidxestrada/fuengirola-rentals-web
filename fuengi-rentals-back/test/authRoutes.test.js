import test, { afterEach, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import app from '../src/app.js';
import User from '../src/models/User.js';
import bcrypt from 'bcrypt';

let server;
let baseUrl;
const restorers = [];

const replaceMethod = (target, key, value) => {
  const original = target[key];
  restorers.push(() => {
    target[key] = original;
  });
  target[key] = value;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return {
    status: response.status,
    body,
  };
};

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

afterEach(() => {
  while (restorers.length > 0) {
    const restore = restorers.pop();
    restore();
  }

  process.env.JWT_SECRET = 'test-secret';
});

test('register devuelve 400 si faltan campos obligatorios', async () => {
  const response = await request('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'sin-nombre@demo.com',
      password: '123456',
    }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    message: 'Nombre, email y contrasena son obligatorios',
  });
});

test('register devuelve 409 si el usuario ya existe', async () => {
  replaceMethod(User, 'findOne', async () => ({
    _id: 'user-id',
  }));

  const response = await request('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Usuario Demo',
      email: 'usuario@demo.com',
      password: '123456',
    }),
  });

  assert.equal(response.status, 409);
  assert.deepEqual(response.body, {
    message: 'El usuario ya existe',
  });
});

test('login devuelve 401 si las credenciales son incorrectas', async () => {
  replaceMethod(User, 'findOne', async () => ({
    _id: 'user-id',
    name: 'Usuario Demo',
    email: 'usuario@demo.com',
    role: 'user',
    password: 'hash',
  }));
  replaceMethod(bcrypt, 'compare', async () => false);

  const response = await request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'usuario@demo.com',
      password: 'incorrecta',
    }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    message: 'Credenciales incorrectas',
  });
});

test('login devuelve 500 si falta JWT_SECRET', async () => {
  delete process.env.JWT_SECRET;

  const response = await request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'usuario@demo.com',
      password: '123456',
    }),
  });

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, {
    message: 'Falta la configuracion de JWT_SECRET',
  });
});

test('auth/me devuelve 401 cuando no se envia token', async () => {
  const response = await request('/api/auth/me');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    message: 'No autorizado, token requerido',
  });
});

test('el middleware devuelve 400 cuando el JSON es invalido', async () => {
  const response = await request('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{"email": "demo@demo.com"',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    message: 'El cuerpo JSON no es valido',
  });
});
