# Despliegue en Hostinger Business + MongoDB Atlas

Arquitectura recomendada:

```text
tudominio.com      -> frontend React/Vite en Hostinger
api.tudominio.com  -> backend Node/Express en Hostinger
MongoDB Atlas Free -> base de datos externa
```

## 1. Crear MongoDB Atlas Free

1. Entra en MongoDB Atlas y crea un proyecto.
2. Crea un cluster gratuito `M0`.
3. Crea un usuario de base de datos con password fuerte.
4. En `Network Access`, permite acceso desde Hostinger. Si no conoces la IP de salida de Hostinger, usa temporalmente `0.0.0.0/0`.
5. Copia la cadena de conexion tipo:

```env
mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/pfm-db?retryWrites=true&w=majority
```

Guarda bien usuario y password. Si el password tiene simbolos raros, MongoDB Atlas suele darte la URI ya escapada.

## 2. Desplegar backend en Hostinger

Usa un subdominio para la API:

```text
api.tudominio.com
```

En hPanel:

1. `Websites` -> `Add Website`.
2. Elige `Node.js Apps`.
3. Conecta GitHub al repo `fuengirola-rentals-web`.
4. Si Hostinger pregunta por carpeta raiz o app directory, usa:

```text
fuengi-rentals-back
```

Si no permite elegir carpeta dentro del repo, sube un ZIP solo de `fuengi-rentals-back`.
5. Framework: `Express.js` u `Other` si no lo detecta.
6. Entry file:

```text
src/server.js
```

7. Install command:

```bash
npm install
```

8. Start command:

```bash
npm run start
```

9. Variables de entorno del backend:

```env
MONGO_URI=mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/pfm-db?retryWrites=true&w=majority
JWT_SECRET=pon-aqui-una-clave-larga-y-segura
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
BOOKING_CALENDAR_SYNC_INTERVAL_MINUTES=30
```

No subas `.env.local` a Hostinger. Usa siempre el panel de variables de entorno.

## 3. Probar backend

Cuando Hostinger termine el despliegue, abre:

```text
https://api.tudominio.com/
```

Debe responder:

```text
API funcionando
```

## 4. Crear el primer admin

Opcion sencilla: pon temporalmente en `fuengi-rentals-back/.env.local` la misma `MONGO_URI` de Atlas y ejecuta en tu PC:

```powershell
cd C:\Users\davii\Documents\fuengirola-rentals-web\fuengi-rentals-back
npm.cmd run crear-admin -- --name "Administrador" --email admin@tudominio.com --password "ClaveSegura123"
```

Despues puedes volver a dejar `.env.local` con la configuracion local.

## 5. Desplegar frontend en Hostinger

Dominio:

```text
tudominio.com
```

En hPanel:

1. `Websites` -> `Add Website`.
2. Elige `Node.js Apps` o frontend web app.
3. Conecta GitHub al repo `fuengirola-rentals-web`.
4. Si Hostinger pregunta por carpeta raiz o app directory, usa:

```text
fuengi-rentals-front
```

Si no permite elegir carpeta dentro del repo, sube un ZIP solo de `fuengi-rentals-front`.
5. Framework: `Vite` o `React`.
6. Install command:

```bash
npm install
```

7. Build command:

```bash
npm run build
```

8. Output directory:

```text
dist
```

9. Variable de entorno del frontend:

```env
VITE_API_URL=https://api.tudominio.com/api
```

## 6. Probar flujo completo

1. Entra en `https://tudominio.com`.
2. Inicia sesion con el admin.
3. Crea los apartamentos.
4. En cada apartamento pega su URL iCal de Booking.
5. Pulsa `Sincronizar Booking`.
6. Comprueba que las fechas ocupadas aparecen en el calendario publico.
7. Haz una solicitud de reserva con un usuario normal.
8. Entra como admin y aprueba o rechaza la solicitud.
9. Si apruebas, bloquea manualmente esas fechas en Booking.

## Notas importantes

- MongoDB Atlas Free es suficiente para 3 apartamentos y este volumen de reservas.
- Las imagenes ahora se guardan en base64 en MongoDB. Sirve para arrancar, pero en produccion conviene moverlas mas adelante a ficheros/Cloudinary y guardar solo URLs.
- La sincronizacion iCal de Booking es de entrada: Booking -> app. La app no escribe en Booking.
- `CORS_ORIGIN` acepta varios dominios separados por comas.
