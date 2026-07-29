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

## Flujo de ramas

- `main`: produccion
- `develop`: integracion de desarrollo
- `feature/*`: nuevas funcionalidades (desde `develop`)
- `bugfix/*`: correcciones no criticas (desde `develop`)
- `hotfix/*`: correcciones urgentes de produccion (desde `main`)

Comandos de ejemplo:

- Crear feature: `git checkout develop && git pull && git checkout -b feature/nombre-corto`
- Crear bugfix: `git checkout develop && git pull && git checkout -b bugfix/nombre-corto`
- Crear hotfix: `git checkout main && git pull && git checkout -b hotfix/nombre-corto`

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

- `https://tu-dominio.app/nfc/f8f3a72d19c`

Al abrirla, el frontend consulta `GET /nfc/:token` y solo cuando pulsas el boton
de accion ejecuta `POST /nfc/:token/consume` para anadir a la lista.

## Proximos pasos

- Modelo de datos real (usuarios, items, listas, recetas)
- Login/register + logout
- CRUD de lista y recetas
- Resolucion NFC -> item
