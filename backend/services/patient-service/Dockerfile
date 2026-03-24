FROM node:20-alpine

WORKDIR /app/backend

COPY backend/services/patient-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/shared ./shared
COPY backend/services/patient-service ./services/patient-service

EXPOSE 4002

CMD ["node", "services/patient-service/src/server.js"]