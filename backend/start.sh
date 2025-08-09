echo "Esperando a PostgreSQL..."

# Esperar a que PostgreSQL esté disponible
while ! nc -z postgres 5432; do
  echo "PostgreSQL no está listo, esperando..."
  sleep 2
done

echo "PostgreSQL está listo!"

# Ejecutar migraciones
echo "Ejecutando migraciones de base de datos..."
npx sequelize-cli db:migrate --env production

# Ejecutar seeders
echo "Ejecutando seeders..."
npx sequelize-cli db:seed:all --env production

echo "Iniciando servidor..."
node server.js