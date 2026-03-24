FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/doctor-service/package*.json ./backend/services/doctor-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/doctor-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/doctor-service ./

EXPOSE 4003
CMD ["node", "src/server.js"]
