FROM node:20-alpine

WORKDIR /app/backend

COPY backend/services/auth-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/shared ./shared
COPY backend/services/auth-service ./services/auth-service

EXPOSE 4001
CMD ["node", "services/auth-service/src/server.js"]
