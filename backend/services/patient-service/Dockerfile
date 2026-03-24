FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/patient-service/package*.json ./backend/services/patient-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/patient-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/patient-service ./

EXPOSE 4002
CMD ["node", "src/server.js"]
