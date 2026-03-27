FROM node:20-alpine

WORKDIR /app/backend

COPY backend/services/notification-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/shared ./shared
COPY backend/services/notification-service ./services/notification-service

EXPOSE 4006
CMD ["node", "services/notification-service/src/server.js"]