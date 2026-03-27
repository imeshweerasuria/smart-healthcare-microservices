FROM node:20-alpine

WORKDIR /app/backend

COPY backend/services/appointment-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/shared ./shared
COPY backend/services/appointment-service ./services/appointment-service

EXPOSE 4004
CMD ["node", "services/appointment-service/src/server.js"]
