FROM node:22-alpine

WORKDIR /app

# Copy ONLY what this service needs + shared
COPY backend/services/payment-service/package*.json ./backend/services/payment-service/
COPY backend/shared ./backend/shared

# Install deps for THIS service
WORKDIR /app/backend/services/payment-service
RUN npm ci --omit=dev

# Copy service source
COPY backend/services/payment-service ./

EXPOSE 4007
CMD ["node", "src/server.js"]
