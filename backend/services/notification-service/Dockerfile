FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/notification-service/package*.json ./backend/services/notification-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/notification-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/notification-service ./

EXPOSE 4006
CMD ["node", "src/server.js"]
