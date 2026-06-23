# ==========================================
# STAGE 1: BASE NODE SETUP (Shared Layer)
# ==========================================
FROM node:18-alpine AS node-base
WORKDIR /app

# ==========================================
# STAGE 2: CATALOG BACKEND SERVICE
# ==========================================
FROM node-base AS catalog-service
COPY backend/catalog-service/package*.json ./
RUN npm install --production
COPY backend/catalog-service/ .
EXPOSE 5002
CMD ["node", "server.js"]

# ==========================================
# STAGE 3: ORDER BACKEND SERVICE
# ==========================================
FROM node-base AS order-service
COPY backend/order-service/package*.json ./
RUN npm install --production
COPY backend/order-service/ .
EXPOSE 5003
CMD ["node", "server.js"]

# ==========================================
# STAGE 4: AUTHENTICATION BACKEND SERVICE (2FA)
# ==========================================
FROM node-base AS auth-service
COPY backend/auth-service/package*.json ./
RUN npm install --production
COPY backend/auth-service/ .
EXPOSE 5001
CMD ["node", "server.js"]

# ==========================================
# STAGE 5: FRONTEND BUILD & NGINX COMPILATION
# ==========================================
FROM node-base AS frontend-build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine AS frontend-client
# 🔄 Changed from /app/dist to /app/build to match Create React App specs:
COPY --from=frontend-build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]