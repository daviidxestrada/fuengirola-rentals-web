# Fuengirola Rentals Web

Monorepo para la web de reservas directas de apartamentos turisticos en Fuengirola.

## Estructura

```text
fuengi-rentals-front  React + Vite
fuengi-rentals-back   Node.js + Express + MongoDB
```

## Desarrollo local

Backend:

```powershell
cd fuengi-rentals-back
npm.cmd install
npm.cmd run dev
```

Frontend:

```powershell
cd fuengi-rentals-front
npm.cmd install
npm.cmd run dev
```

## Despliegue

La guia de despliegue esta en:

```text
DEPLOY_HOSTINGER_MONGODB.md
```

Arquitectura prevista:

```text
tudominio.com      -> frontend en Hostinger
api.tudominio.com  -> backend en Hostinger
MongoDB Atlas      -> base de datos
```
