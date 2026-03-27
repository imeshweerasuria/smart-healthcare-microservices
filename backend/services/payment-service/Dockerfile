FROM node:20-alpine

WORKDIR /app/backend

COPY backend/services/payment-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/shared ./shared
COPY backend/services/payment-service ./services/payment-service

EXPOSE 4007
CMD ["node", "services/payment-service/src/server.js"]
