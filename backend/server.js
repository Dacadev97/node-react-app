/**
 * @fileoverview Servidor principal de la API Konecta
 * @description API REST para el Sistema de Gestión de Empleados y Solicitudes
 * @version 1.0.0
 * @author Davidson Cadavid
 * @created 2025
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { testConnection } = require("./src/config/database");
const routes = require("./src/routes");
const { errorHandler } = require("./src/middleware/validation");

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * CONFIGURACIÓN DE MIDDLEWARES DE SEGURIDAD
 */

// Helmet: Configura headers de seguridad HTTP
app.use(helmet());

/**
 * CORS: Control de acceso entre orígenes
 * - Solo permite conexiones desde localhost (desarrollo)
 * - Habilita credentials para autenticación JWT
 * - Valida origen con expresión regular
 */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * Rate Limiting: Limitación de solicitudes por IP
 * - Ventana de tiempo: 15 minutos (configurable)
 * - Máximo de solicitudes: 100 por IP (configurable)
 * - Solo aplicado a rutas /api/*
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta de nuevo más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

/**
 * CONFIGURACIÓN DE MIDDLEWARES DE PROCESAMIENTO
 */

// Parsing de JSON con límite de 10MB
app.use(express.json({ limit: "10mb" }));
// Parsing de datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * MIDDLEWARE DE LOGGING
 * Registra todas las solicitudes HTTP con timestamp
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * CONFIGURACIÓN DE RUTAS
 */

// Rutas principales de la API bajo el prefijo /api/v1
app.use("/api/v1", routes);

/**
 * RUTAS DE LA APLICACIÓN
 */

/**
 * Ruta raíz de la API
 * @route GET /
 * @description Devuelve información general de la API y documentación
 * @returns {Object} 200 - Información de la API
 * @returns {boolean} returns.success - Estado de la respuesta
 * @returns {string} returns.message - Mensaje descriptivo
 * @returns {string} returns.version - Versión de la API
 * @returns {string} returns.documentation - URL de documentación
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Konecta - Sistema de Gestión de Empleados y Solicitudes",
    version: "1.0.0",
    documentation: "/api/v1/health",
  });
});

/**
 * Manejo de rutas no encontradas
 * @route * *
 * @description Captura todas las rutas no definidas
 * @returns {Object} 404 - Error de ruta no encontrada
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Middleware global de manejo de errores
app.use(errorHandler);

/**
 * FUNCIÓN DE INICIALIZACIÓN DEL SERVIDOR
 * Prueba la conexión a la base de datos antes de iniciar el servidor
 * En modo test, no inicia el servidor HTTP para evitar conflictos
 */
const startServer = async () => {
  try {
    // Test de conexión a la base de datos
    await testConnection();

    // Solo inicia el servidor HTTP si no está en modo test
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en puerto ${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV}`);
        console.log(`URL: http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
      });
    }
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
};

/**
 * MANEJO DE PROCESOS Y SEÑALES DEL SISTEMA
 * Handlers para excepciones no capturadas y cierre limpio del servidor
 */

/**
 * Handler para excepciones no capturadas
 * @param {Error} error - Error no capturado
 */
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

/**
 * Handler para promesas rechazadas no manejadas
 * @param {*} reason - Razón del rechazo
 * @param {Promise} promise - Promesa rechazada
 */
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

/**
 * Handler para señal SIGTERM (terminación del proceso)
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando servidor...");
  process.exit(0);
});

/**
 * Handler para señal SIGINT (interrupción del proceso)
 */
process.on("SIGINT", () => {
  console.log("SIGINT recibido, cerrando servidor...");
  process.exit(0);
});

// Inicializar el servidor
startServer();

// Exportar la aplicación para testing
module.exports = app;
