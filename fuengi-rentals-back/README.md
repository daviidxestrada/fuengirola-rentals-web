# Backend PFM

API REST construida con Express y MongoDB para gestionar autenticacion, apartamentos, reservas y bloqueos manuales de fechas.

## Requisitos

- Node.js 20 o superior.
- Instancia de MongoDB accesible desde `MONGO_URI`.

## Configuracion

1. Copia `backend/.env.example` como `backend/.env.local`.
2. Configura las variables:

- `PORT`: puerto del backend.
- `MONGO_URI`: cadena de conexion a MongoDB.
- `JWT_SECRET`: clave de firma para los tokens.
- `CORS_ORIGIN`: origen permitido del frontend. Admite varios orígenes separados por comas.

## Instalacion

```bash
npm install
```

## Scripts disponibles

```bash
npm run test
npm run dev
npm run start
npm run crear-admin -- --name "Administrador" --email admin@demo.com --password "ClaveSegura123"
```

## Tests minimos

```bash
npm test
```

La bateria actual cubre validaciones basicas de `auth` y manejo consistente de errores HTTP.

## Bootstrap del primer admin

Para crear el primer administrador sin tocar MongoDB manualmente:

```bash
npm run crear-admin -- --name "Administrador" --email admin@demo.com --password "ClaveSegura123"
```

Comportamiento del script:

- Si el usuario no existe, lo crea con rol `admin`.
- Si el usuario ya existe, actualiza nombre, contraseña y rol a `admin`.

## Rutas disponibles

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Apartments

- `GET /api/apartments`
- `GET /api/apartments/:id`
- `POST /api/apartments`
- `PUT /api/apartments/:id`
- `DELETE /api/apartments/:id`

### Reservations

- `GET /api/reservations/availability/:apartmentId`
- `GET /api/reservations/mine`
- `GET /api/reservations`
- `GET /api/reservations/:id`
- `POST /api/reservations`
- `PATCH /api/reservations/:id/status`
- `DELETE /api/reservations/:id`

### Blocks

- `GET /api/blocks`
- `POST /api/blocks`
- `DELETE /api/blocks/:id`

## Coleccion Postman

La coleccion actualizada se encuentra en `backend/api_doc`.
