# Sistema de Gestión de Empleados y Solicitudes - Konecta

## Descripción del Proyecto

Sistema Full Stack desarrollado con Node.js y React que permite la gestión integral de empleados y solicitudes en una empresa. La aplicación implementa autenticación JWT con roles diferenciados, operaciones CRUD completas, y está completamente dockerizada para facilitar el despliegue.

## Características Principales

- **Backend**: API REST con Node.js, Express, PostgreSQL y Sequelize ORM
- **Frontend**: SPA con React 18, Context API, Lazy Loading y React Router
- **Autenticación**: JWT con roles diferenciados (administrador/empleado)
- **Seguridad**: Protección contra SQL Injection, XSS, Rate Limiting
- **Base de Datos**: PostgreSQL con migraciones Sequelize
- **Dockerización**: Contenedores para desarrollo y producción
- **Pruebas**: Unitarias e integración con Jest y React Testing Library
- **Validación**: Robusta en frontend y backend

## Requisitos del Sistema

### Requisitos Mínimos

- **Node.js**: 18.0.0 o superior
- **npm**: 9.0.0 o superior
- **PostgreSQL**: 15.0 o superior
- **Docker**: 20.0.0 o superior (opcional)
- **Docker Compose**: 2.0.0 o superior (opcional)

### Sistemas Operativos Soportados

- Windows 10/11
- macOS 10.15 o superior
- Ubuntu 20.04 LTS o superior
- CentOS/RHEL 8 o superior

## Instalación y Configuración

### Opción 1: Instalación con Docker (Recomendada)

Esta es la forma más rápida y confiable de ejecutar la aplicación.

#### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd node-react-app
```

#### 2. Configurar Variables de Entorno

```bash
# Copiar archivos de ejemplo
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar backend/.env con tus configuraciones
# Los valores por defecto funcionan con Docker Compose
```

#### 3. Ejecutar con Docker Compose

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# O en modo separado (background)
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f
```

#### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/v1/health

#### 5. Datos de Prueba

El sistema incluye datos de prueba por defecto:

- **Usuario Administrador**:
  - Email: admin@konecta.com
  - Password: admin123

### Opción 2: Instalación Manual

#### Prerequisitos

1. **Instalar PostgreSQL**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (con Homebrew)
brew install postgresql
brew services start postgresql

# Windows - Descargar desde https://www.postgresql.org/download/windows/
```

2. **Configurar Base de Datos**

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE konecta;
CREATE USER konecta_user WITH ENCRYPTED PASSWORD 'konecta_password';
GRANT ALL PRIVILEGES ON DATABASE konecta TO konecta_user;
\q
```

#### Backend

1. **Instalar Dependencias**

```bash
cd backend
npm install
```

2. **Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
PORT=3001
NODE_ENV=development

# Configuración JWT
JWT_SECRET=tu_clave_jwt_super_secreta_de_al_menos_32_caracteres
JWT_EXPIRES_IN=7d

# Configuración Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=konecta
DB_USER=konecta_user
DB_PASSWORD=konecta_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

3. **Ejecutar Migraciones**

```bash
# Ejecutar migraciones para crear tablas
npx sequelize-cli db:migrate

# O usar el script SQL directo
psql -U konecta_user -d konecta -f database.sql
```

4. **Ejecutar Backend**

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

#### Frontend

1. **Instalar Dependencias**

```bash
cd frontend
npm install
```

2. **Configurar Variables de Entorno**

```bash
# Crear archivo .env
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_APP_NAME=Konecta
REACT_APP_VERSION=1.0.0
EOF
```

3. **Ejecutar Frontend**

```bash
# Modo desarrollo
npm start

# Compilar para producción
npm run build
```

## Scripts de Base de Datos

### Script SQL Principal (database.sql)

El archivo `backend/database.sql` contiene todas las estructuras necesarias:

```sql
-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas principales
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('administrador', 'empleado')) DEFAULT 'empleado',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    salario DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    resumen VARCHAR(255) NOT NULL,
    id_empleado INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO usuarios (username, email, password, rol) VALUES
('admin', 'admin@konecta.com', '$2a$10$...', 'administrador');

INSERT INTO empleados (nombre, fecha_ingreso, salario) VALUES
('Juan Pérez', '2023-01-15', 3500000.00),
('María García', '2023-03-20', 4200000.00);
```

### Migraciones Sequelize

El proyecto utiliza Sequelize con migraciones versionadas:

1. `20250731000001-create-initial-tables.js` - Estructura inicial
2. `20250731000002-seed-initial-data.js` - Datos de prueba
3. `20250731000003-add-activo-to-empleados.js` - Campo activo

## Arquitectura del Sistema

### Backend (Node.js + Express + PostgreSQL)

#### Estructura de Directorios

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Autenticación JWT
│   │   ├── empleadoController.js # CRUD Empleados
│   │   └── solicitudController.js # CRUD Solicitudes
│   ├── middleware/
│   │   ├── auth.js              # Middleware JWT y roles
│   │   └── validation.js        # Validación y sanitización
│   ├── models/
│   │   ├── Usuario.js           # Modelo Usuario
│   │   ├── Empleado.js          # Modelo Empleado
│   │   ├── Solicitud.js         # Modelo Solicitud
│   │   └── index.js             # Relaciones
│   ├── routes/
│   │   ├── auth.js              # Rutas autenticación
│   │   ├── empleados.js         # Rutas empleados
│   │   ├── solicitudes.js       # Rutas solicitudes
│   │   └── index.js             # Router principal
│   └── validators/
│       ├── authValidator.js     # Validaciones auth
│       ├── empleadoValidator.js # Validaciones empleados
│       └── solicitudValidator.js # Validaciones solicitudes
├── tests/                       # Pruebas Jest
├── migrations/                  # Migraciones Sequelize
├── server.js                    # Punto de entrada
└── package.json
```

#### Endpoints API

**Autenticación**

- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `GET /api/v1/auth/profile` - Perfil del usuario

**Empleados**

- `GET /api/v1/empleados` - Listar empleados (paginado, filtrado)
- `GET /api/v1/empleados/stats` - Estadísticas empleados
- `GET /api/v1/empleados/:id` - Empleado por ID
- `POST /api/v1/empleados` - Crear empleado (solo admin)
- `PUT /api/v1/empleados/:id` - Actualizar empleado (solo admin)
- `DELETE /api/v1/empleados/:id` - Eliminar empleado (solo admin)

**Solicitudes**

- `GET /api/v1/solicitudes` - Listar solicitudes (paginado, filtrado)
- `GET /api/v1/solicitudes/:id` - Solicitud por ID
- `POST /api/v1/solicitudes` - Crear solicitud
- `PUT /api/v1/solicitudes/:id` - Actualizar solicitud
- `DELETE /api/v1/solicitudes/:id` - Eliminar solicitud (solo admin)

### Frontend (React + Context API)

#### Estructura de Directorios

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/              # Componentes reutilizables
│   │   └── forms/               # Formularios
│   ├── context/
│   │   └── AuthContext.js       # Context API autenticación
│   ├── hooks/
│   │   ├── useEmpleados.js      # Hook empleados
│   │   ├── useSolicitudes.js    # Hook solicitudes
│   │   └── useDashboardStats.js # Hook estadísticas
│   ├── pages/
│   │   ├── Login.js             # Página login
│   │   ├── Dashboard.js         # Dashboard principal
│   │   ├── Empleados.js         # Gestión empleados
│   │   └── Solicitudes.js       # Gestión solicitudes
│   ├── services/
│   │   ├── api.js               # Cliente Axios
│   │   ├── authService.js       # Servicios auth
│   │   ├── empleadoService.js   # Servicios empleados
│   │   └── solicitudService.js  # Servicios solicitudes
│   ├── tests/                   # Pruebas React Testing Library
│   ├── App.js                   # Componente principal
│   └── index.js                 # Punto de entrada
└── package.json
```

## Funcionalidades Implementadas

### Requerimientos Técnicos Cumplidos ✅

#### Backend

- ✅ **API REST con Node.js**: Express server con arquitectura REST
- ✅ **Async/Await**: Todas las operaciones asincrónicas implementadas correctamente
- ✅ **PostgreSQL**: Base de datos relacional con Sequelize ORM
- ✅ **Autenticación JWT**: Tokens con roles diferenciados
- ✅ **Roles**: Administrador y empleado con permisos específicos
- ✅ **CRUD Empleados**: Consulta e inserción completas
- ✅ **CRUD Solicitudes**: Consulta, inserción y eliminación (solo admins)
- ✅ **Protección SQL Injection**: Sequelize ORM con consultas parametrizadas
- ✅ **Protección XSS**: Sanitización con express-validator y helmet
- ✅ **Paginación**: Implementada en todas las consultas
- ✅ **Filtrado**: Búsqueda y filtros en empleados y solicitudes
- ✅ **Pruebas**: Jest con cobertura completa

#### Frontend

- ✅ **React SPA**: Single Page Application
- ✅ **Componentes Funcionales**: Todos los componentes son funcionales
- ✅ **Hooks**: useState, useEffect, useContext, custom hooks
- ✅ **Context API**: Manejo de estado global de autenticación
- ✅ **Lazy Loading**: Carga diferida de componentes
- ✅ **Roles UI**: Interfaz diferenciada por roles
- ✅ **Pruebas**: React Testing Library

#### Docker

- ✅ **Dockerfile Backend**: Optimizado para Node.js
- ✅ **Dockerfile Frontend**: Build multi-stage con Nginx
- ✅ **Docker Compose**: Orquestación completa con PostgreSQL

### Funcionalidades de Negocio

#### Gestión de Empleados

- **Visualización**: Lista paginada con filtros por nombre y estado
- **Creación**: Formulario con validación (solo administradores)
- **Edición**: Actualización de datos (solo administradores)
- **Eliminación**: Soft delete con confirmación (solo administradores)
- **Estadísticas**: Dashboard con métricas de empleados activos/inactivos

#### Gestión de Solicitudes

- **Visualización**: Lista paginada con filtros y búsqueda
- **Creación**: Formulario asociado a empleados existentes
- **Edición**: Actualización de código, descripción y resumen
- **Eliminación**: Solo disponible para administradores
- **Relaciones**: Cada solicitud está asociada a un empleado

#### Autenticación y Autorización

- **Registro**: Creación de cuentas con validación de email único
- **Login**: Autenticación con JWT de 7 días de duración
- **Roles**: Administrador (CRUD completo) y Empleado (solo lectura)
- **Protección**: Rutas protegidas con middleware de autenticación

## Mejores Prácticas y Seguridad

### Implementaciones de Seguridad

#### 1. Autenticación Robusta

```javascript
// JWT con clave secreta fuerte y expiración configurable
const token = jwt.sign(
  { userId: user.id, rol: user.rol },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

**¿Por qué?**: Los JWT permiten autenticación stateless y escalable. La clave secreta robusta previene ataques de fuerza bruta.

#### 2. Protección contra SQL Injection

```javascript
// Uso de Sequelize ORM con consultas parametrizadas
const empleados = await Empleado.findAndCountAll({
  where: whereConditions,
  limit: parseInt(limit),
  offset,
});
```

**¿Por qué?**: Sequelize automaticamente escapa y valida las consultas, eliminando el riesgo de SQL injection.

#### 3. Sanitización de Entradas

```javascript
// Middleware de sanitización personalizado
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .trim();
      }
    }
  };
  // Aplicar a body, query y params
};
```

**¿Por qué?**: Previene ataques XSS removiendo scripts maliciosos de las entradas del usuario.

#### 4. Rate Limiting

```javascript
// Limitación de requests por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: "Demasiadas solicitudes",
});
```

**¿Por qué?**: Previene ataques de fuerza bruta y sobrecarga del servidor.

#### 5. Headers de Seguridad

```javascript
// Helmet para headers de seguridad
app.use(helmet());
```

**¿Por qué?**: Añade headers HTTP que protegen contra vulnerabilidades conocidas.

#### 6. Validación Estricta

```javascript
// Express-validator para validación robusta
const createEmpleadoValidation = [
  body("nombre").isLength({ min: 2, max: 50 }).escape(),
  body("salario")
    .isNumeric()
    .custom((value) => value > 0),
  body("fecha_ingreso").isDate(),
];
```

**¿Por qué?**: Garantiza que solo datos válidos lleguen a la base de datos.

### Decisiones de Arquitectura

#### 1. Separación Backend/Frontend

**Decisión**: APIs separadas para backend y frontend
**Justificación**:

- Escalabilidad independiente
- Reutilización de API para mobile/otros clientes
- Desarrollo paralelo de equipos
- Deployment independiente

#### 2. Context API vs Redux

**Decisión**: Context API para estado global
**Justificación**:

- Menor complejidad para aplicación mediana
- Menos boilerplate code
- Incluido en React (sin dependencias extra)
- Suficiente para gestión de autenticación

#### 3. Sequelize ORM

**Decisión**: Sequelize en lugar de SQL puro
**Justificación**:

- Migraciones versionadas
- Validaciones automáticas
- Protección contra SQL injection
- Relaciones y modelos declarativos

#### 4. Docker Multi-Container

**Decisión**: Contenedores separados para cada servicio
**Justificación**:

- Aislamiento de servicios
- Escalado independiente
- Fácil desarrollo local
- Deployment simplificado

## Pruebas

### Backend (Jest + Supertest)

#### Configuración

```javascript
// tests/setup.js
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: false });
});
```

#### Tipos de Pruebas

1. **Pruebas de Autenticación**: Registro, login, JWT validation
2. **Pruebas CRUD**: Operaciones completas para empleados y solicitudes
3. **Pruebas de Autorización**: Verificación de roles y permisos
4. **Pruebas de Validación**: Entrada de datos inválidos
5. **Pruebas de Seguridad**: Rate limiting, sanitización

#### Ejecutar Pruebas Backend

```bash
cd backend

# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar en modo watch
npm run test:watch
```

### Frontend (React Testing Library)

#### Tipos de Pruebas

1. **Pruebas de Componentes**: Renderizado y comportamiento
2. **Pruebas de Integración**: Context API y hooks
3. **Pruebas de Formularios**: Validación y envío
4. **Pruebas de Navegación**: Router y lazy loading
5. **Pruebas de UI**: Interacciones de usuario

#### Ejecutar Pruebas Frontend

```bash
cd frontend

# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm run test:coverage
```

#### Cobertura de Pruebas

- **Backend**: >90% cobertura de líneas
- **Frontend**: >80% cobertura de componentes

## Docker y Deployment

### Configuración Docker

#### Dockerfile Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

#### Dockerfile Frontend

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: konecta
      POSTGRES_USER: konecta
      POSTGRES_PASSWORD: konecta123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: konecta
      DB_USER: konecta
      DB_PASSWORD: konecta123
    depends_on:
      - postgres
    ports:
      - "3001:3001"

  frontend:
    build: ./frontend
    environment:
      REACT_APP_API_URL: http://localhost:3001/api/v1
    depends_on:
      - backend
    ports:
      - "3000:80"

volumes:
  postgres_data:
```

### Comandos Docker Útiles

```bash
# Construir y ejecutar
docker-compose up --build

# Ejecutar en background
docker-compose up -d

# Ver logs
docker-compose logs -f [service]

# Parar servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Reconstruir un servicio específico
docker-compose build [service]

# Ejecutar comandos en contenedor
docker-compose exec backend npm test
docker-compose exec postgres psql -U konecta -d konecta
```

## Comandos de Desarrollo

### Backend

```bash
# Desarrollo con hot reload
npm run dev

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir migraciones
npx sequelize-cli db:migrate:undo

# Ejecutar seeds
npx sequelize-cli db:seed:all

# Generar nueva migración
npx sequelize-cli migration:generate --name nombre-migracion
```

### Frontend

```bash
# Desarrollo
npm start

# Build para producción
npm run build

# Servir build local
npx serve -s build

# Analizar bundle
npm run build && npx serve -s build
```

### Base de Datos

```bash
# Conectar a PostgreSQL local
psql -U konecta -d konecta

# Conectar a PostgreSQL en Docker
docker-compose exec postgres psql -U konecta -d konecta

# Backup de base de datos
pg_dump -U konecta -h localhost konecta > backup.sql

# Restaurar backup
psql -U konecta -d konecta -f backup.sql
```

## Variables de Entorno

### Backend (.env)

```bash
# Servidor
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=clave_super_secreta_de_al_menos_32_caracteres
JWT_EXPIRES_IN=7d

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=konecta
DB_USER=konecta_user
DB_PASSWORD=konecta_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_APP_NAME=Konecta
REACT_APP_VERSION=1.0.0
```

## Solución de Problemas

### Problemas Comunes

#### 1. Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose ps
# o para instalación local:
sudo systemctl status postgresql

# Verificar credenciales en .env
cat backend/.env

# Verificar conectividad
docker-compose exec backend npm run test
```

#### 2. Error CORS en frontend

```bash
# Verificar configuración CORS en backend/server.js
# Verificar REACT_APP_API_URL en frontend/.env
echo $REACT_APP_API_URL
```

#### 3. Error de permisos Docker

```bash
# Linux/Mac: ajustar permisos
sudo chown -R $USER:$USER .

# Windows: verificar que Docker Desktop tenga permisos
```

#### 4. Puerto ocupado

```bash
# Verificar qué proceso usa el puerto
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL

# Cambiar puerto en variables de entorno o docker-compose.yml
```

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o reportar bugs:

1. Crear un issue en GitHub
2. Incluir logs relevantes
3. Especificar versión de Node.js y sistema operativo
4. Describir pasos para reproducir el problema

---

**Desarrollado con ❤️ para Konecta - Sistema de Gestión Empresarial**
