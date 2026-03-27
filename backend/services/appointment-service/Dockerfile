FROM node:20-alpine

WORKDIR /app

COPY backend/services/appointment-service/package*.json ./backend/services/appointment-service/
COPY backend/shared ./backend/shared

WORKDIR /app/backend/services/appointment-service
RUN npm ci --omit=dev

COPY backend/services/appointment-service ./

EXPOSE 4004
CMD ["node", "src/server.js"]
