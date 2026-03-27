FROM node:20-alpine 
WORKDIR /app/backend 
COPY backend/services/telemedicine-service/package*.json ./ 
RUN npm ci --omit=dev 
COPY backend/shared ./shared 
COPY backend/services/telemedicine-service ./services/telemedicine-service 
EXPOSE 4005 
CMD ["node", "services/telemedicine-service/src/server.js"] 
