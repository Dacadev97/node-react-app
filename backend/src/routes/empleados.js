const express = require("express");
const EmpleadoController = require("../controllers/empleadoController");
const {
  createEmpleadoValidation,
  getEmpleadoValidation,
  queryValidation,
} = require("../validators/empleadoValidator");
const {
  handleValidationErrors,
  sanitizeInput,
} = require("../middleware/validation");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

router.get("/stats", EmpleadoController.getStats);

router.get(
  "/",
  sanitizeInput,
  queryValidation,
  handleValidationErrors,
  EmpleadoController.getAll
);

router.get(
  "/:id",
  sanitizeInput,
  getEmpleadoValidation,
  handleValidationErrors,
  EmpleadoController.getById
);

router.post(
  "/",
  requireAdmin,
  sanitizeInput,
  createEmpleadoValidation,
  handleValidationErrors,
  EmpleadoController.create
);

router.put(
  "/:id",
  requireAdmin,
  sanitizeInput,
  createEmpleadoValidation,
  handleValidationErrors,
  EmpleadoController.update
);

router.delete(
  "/:id",
  requireAdmin,
  sanitizeInput,
  getEmpleadoValidation,
  handleValidationErrors,
  EmpleadoController.delete
);

module.exports = router;
