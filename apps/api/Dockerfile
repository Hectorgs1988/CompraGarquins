FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN npm install

COPY . .

EXPOSE 4100

CMD ["sh", "-c", "npm run dev -w apps/api"]
