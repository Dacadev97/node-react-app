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

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["http://localhost:3000"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Konecta - Sistema de Gestión de Empleados y Solicitudes",
    version: "1.0.0",
    documentation: "/api/v1/health",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();

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

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT recibido, cerrando servidor...");
  process.exit(0);
});

startServer();

module.exports = app;
