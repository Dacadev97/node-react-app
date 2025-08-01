# Frontend Dockerfile - Optimizado
FROM node:18-alpine AS builder

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copiar archivos de dependencias primero (optimización de cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install
RUN npm ci --only=production --silent

# Copiar código fuente
COPY . .

# Variables de entorno para optimización
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production

# Copiar archivos construidos
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
