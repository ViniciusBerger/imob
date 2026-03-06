# ========== FRONTEND BUILD STAGE ==========
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ========== BACKEND BUILD STAGE ==========
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install
COPY backend/ .
# Instala TS config se não copiado (garantia)
RUN npx prisma generate
RUN npm run build

# ========== PRODUCTION STAGE ==========
FROM node:18-alpine AS production

# Fix Prisma OpenSSL 1.1/3.0 compatibility
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy Backend Build
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma

# Copy Frontend Build to 'client' folder in root (matches ../client in AppModule)
COPY --from=frontend-builder /app/frontend/dist ./client

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
