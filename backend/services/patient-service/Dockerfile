FROM node:20-alpine

WORKDIR /app

COPY backend/services/patient-service/package*.json ./backend/services/patient-service/
COPY backend/shared ./backend/shared

WORKDIR /app/backend/services/patient-service
RUN npm ci --omit=dev

COPY backend/services/patient-service ./

EXPOSE 4002
CMD ["node", "src/server.js"]
