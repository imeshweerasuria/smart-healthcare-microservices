FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/telemedicine-service/package*.json ./backend/services/telemedicine-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/telemedicine-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/telemedicine-service ./

EXPOSE 4005
CMD ["node", "src/server.js"]
