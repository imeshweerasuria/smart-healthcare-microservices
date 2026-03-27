FROM node:20-alpine

WORKDIR /app

COPY backend/services/notification-service/package*.json ./backend/services/notification-service/
COPY backend/shared ./backend/shared

WORKDIR /app/backend/services/notification-service
RUN npm ci --omit=dev

COPY backend/services/notification-service ./

EXPOSE 4006
CMD ["node", "src/server.js"]
