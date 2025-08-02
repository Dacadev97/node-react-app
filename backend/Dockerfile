FROM node:18-alpine

# Instalar netcat para verificar la conexión de PostgreSQL
RUN apk add --no-cache netcat-openbsd

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

# Instalar Sequelize CLI globalmente
RUN npm install -g sequelize-cli

COPY . .

# Hacer el script ejecutable
RUN chmod +x start.sh

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

RUN chown -R nodeuser:nodejs /usr/src/app
USER nodeuser

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["/bin/sh", "./start.sh"]
