const express = require("express");
const authRoutes = require("./auth");
const empleadosRoutes = require("./empleados");
const solicitudesRoutes = require("./solicitudes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/empleados", empleadosRoutes);
router.use("/solicitudes", solicitudesRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
