FROM node:20-alpine 
WORKDIR /app/backend 
COPY backend/services/doctor-service/package*.json ./ 
RUN npm ci --omit=dev 
COPY backend/shared ./shared 
COPY backend/services/doctor-service ./services/doctor-service 
EXPOSE 4003 
CMD ["node", "services/doctor-service/src/server.js"] 