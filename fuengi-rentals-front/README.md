# Frontend PFM

Aplicacion cliente construida con React y Vite para el flujo publico de consulta y reserva, el acceso de usuario y el panel de administracion.

## Requisitos

- Node.js 20 o superior.
- Backend levantado y accesible desde la URL configurada en `VITE_API_URL`.

## Configuracion

1. Copia `frontend/.env.example` como `frontend/.env.local`.
2. Ajusta la variable `VITE_API_URL` si el backend no corre en `http://localhost:5000/api`.

## Instalacion

```bash
npm install
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Flujo de uso recomendado

1. Arranca el backend.
2. Arranca el frontend con `npm run dev`.
3. Abre la aplicacion en el puerto que indique Vite.
4. Crea o promociona el primer admin desde el backend con el script `npm run crear-admin`.
5. Accede al login desde `/login`.

## Rutas principales

- `/`: portada publica.
- `/apartments`: listado de apartamentos.
- `/apartments/:id`: detalle del apartamento y formulario real de reserva.
- `/register`: registro de usuarios.
- `/login`: inicio de sesion de usuario o admin.
- `/account`: panel del usuario autenticado con sus reservas.
- `/admin`: panel privado de administracion.

## Notas de validacion

- El flujo de reserva operativo esta en la vista de detalle de apartamento.
- La ruta `/reserve` existe en el router, pero actualmente es una pantalla placeholder y no forma parte del flujo principal de demo.
- El token JWT se guarda en `localStorage` para mantener la sesion entre recargas.
