FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/auth-service/package*.json ./backend/services/auth-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/auth-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/auth-service ./

EXPOSE 4001
CMD ["node", "src/server.js"]
