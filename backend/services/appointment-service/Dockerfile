FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/appointment-service/package*.json ./backend/services/appointment-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/appointment-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/appointment-service ./

EXPOSE 4004
CMD ["node", "src/server.js"]
