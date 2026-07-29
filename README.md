# CestaGarquins (PWA)

Estructura base para una app de lista de la compra inteligente con NFC y recetas.

## Stack

- Frontend: React + Vite + PWA
- Backend: Node + Express
- DB: PostgreSQL o MySQL (via Knex)
- Autenticacion: sesiones persistentes (express-session + connect-session-knex)
- NFC: enlaces NDEF (tags que abren URLs de la app)

## Estructura

- `apps/web`: cliente React (PWA)
- `apps/api`: API Express

## Arranque rapido

1. Instala dependencias:
   - `npm install`
2. Duplica variables:
   - `cp .env.example .env`
3. Levanta una base de datos (elige una):
   - PostgreSQL: `docker compose --profile postgres up -d`
   - MySQL: `docker compose --profile mysql up -d`
   - Si el 3306 esta ocupado: `MYSQL_HOST_PORT=3307 docker compose --profile mysql up -d`
4. Ajusta `DB_CLIENT` y credenciales en `.env` (`postgres` o `mysql2`).
5. Inicia en desarrollo:
   - `npm run dev`

Frontend: http://localhost:5174
Backend: http://localhost:4100

## Flujo NFC (NDEF)

La idea base es grabar tags NFC con una URL de la app, por ejemplo:

- `https://tu-dominio.app/nfc/arroz`

Al abrirla, la app interpreta el slug (`arroz`) y propone anadir/actualizar ese articulo.

## Proximos pasos

- Modelo de datos real (usuarios, items, listas, recetas)
- Login/register + logout
- CRUD de lista y recetas
- Resolucion NFC -> item
