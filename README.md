# CestaGarquins (PWA)

Aplicacion web para gestionar lista de la compra con soporte NFC y seccion de recetas.

## Estado actual

- Lista de la compra:
  - Alta manual de productos con cantidad.
  - Edicion de cantidad desde la propia lista.
  - Si una cantidad llega a 0 al disminuir, se solicita confirmacion y se elimina el producto.
  - Movimiento de productos entre lista y cesta.
  - Finalizacion de compra (elimina lo que esta en cesta).
- Recetas:
  - Consulta de recetas.
  - Alta de receta con nombre, descripcion, ingredientes y pasos.
  - Vista de detalle al abrir una receta.
  - Accion para anadir ingredientes de una receta a la lista como items individuales.
  - Los ingredientes anadidos desde receta quedan identificados como grupo por nombre de receta.
- NFC:
  - Lectura de tag por token.
  - Consumo de tag para anadir a lista (requiere sesion autenticada).

## Stack

- Frontend: React + Vite + PWA
- Backend: Node.js + Express
- DB soportada por Knex: sqlite3 (por defecto), mysql2, postgres
- Sesiones: express-session + connect-session-knex

## Estructura

- apps/web: cliente React
- apps/api: API Express
- docker-compose.yml: entorno Docker (MySQL + API + Web + Adminer)

## Scripts del monorepo

Desde la raiz:

- npm run dev: levanta web + api en paralelo.
- npm run dev:mobile: levanta web en host 0.0.0.0 + api para pruebas en movil.
- npm run dev:web: solo frontend.
- npm run dev:api: solo backend.
- npm run build: build del frontend.
- npm run lint: lint del frontend.

## Configuracion de entorno

1. Instala dependencias:
   - npm install
2. Crea tu .env desde el ejemplo:
   - cp .env.example .env

Variables importantes en .env:

- DB_CLIENT: sqlite3 (por defecto), mysql2 o postgres.
- Para sqlite3:
  - DB_FILE define la ruta del fichero (por defecto ./data/cestagarquins.sqlite3).
- Para mysql2/postgres:
  - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.

## Arranque rapido (opcion recomendada local)

### Opcion A: sqlite3 (sin Docker)

1. Revisa DB_CLIENT=sqlite3 en .env.
2. Ejecuta:
   - npm run dev

Servicios:

- Frontend: http://localhost:5174
- API: http://localhost:4100

### Opcion B: Docker con MySQL

1. Revisa DB_CLIENT=mysql2 en .env (si quieres conectar tu API local al MySQL del compose).
2. Levanta contenedores:
   - docker compose up -d
3. Si quieres desarrollo local con hot reload, puedes ejecutar web/api fuera de Docker con npm run dev y apuntar al MySQL del compose.

Puertos por defecto del compose:

- Web: 5174
- API: 4100
- MySQL: 3307 (host) -> 3306 (contenedor)
- Adminer: 8081

## Pruebas en movil

1. Arranca con npm run dev:mobile.
2. Localiza tu IP local en la misma red Wi-Fi.
3. Abre en el movil: http://TU_IP:5174

Notas:

- Si VITE_API_URL no esta definido, el frontend usa automaticamente http://<mismo-host>:4100.
- En desarrollo, la API permite origenes LAN privadas ademas de CORS_ORIGIN.

## Endpoints principales

- GET /health
- Auth:
  - POST /auth/login
  - POST /auth/logout
  - GET /auth/me
- Lista:
  - GET /list
  - POST /list
  - PATCH /list/:id
  - DELETE /list/:id
  - POST /list/:id/cart
  - POST /list/:id/restore
  - POST /list/finalize
- Recetas:
  - GET /recipes
  - POST /recipes
- NFC:
  - GET /nfc/:token
  - POST /nfc/:token/consume (requiere auth)

## Notas funcionales importantes

- Las recetas se almacenan actualmente en memoria en la API (no persistentes tras reinicio).
- La lista de la compra si se persiste en base de datos.
- Los ingredientes anadidos desde una receta se guardan como source=recipe y con recipe_group para distinguir su grupo.

## Flujo de ramas (propuesto)

- main: produccion
- develop: integracion
- feature/*: nuevas funcionalidades
- bugfix/*: correcciones no criticas
- hotfix/*: correcciones urgentes
