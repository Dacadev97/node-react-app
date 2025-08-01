const express = require("express");
const SolicitudController = require("../controllers/solicitudController");
const {
  createSolicitudValidation,
  getSolicitudValidation,
  querySolicitudValidation,
} = require("../validators/solicitudValidator");
const {
  handleValidationErrors,
  sanitizeInput,
} = require("../middleware/validation");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

router.get(
  "/",
  sanitizeInput,
  querySolicitudValidation,
  handleValidationErrors,
  SolicitudController.getAll
);

router.get(
  "/:id",
  sanitizeInput,
  getSolicitudValidation,
  handleValidationErrors,
  SolicitudController.getById
);

router.post(
  "/",
  sanitizeInput,
  createSolicitudValidation,
  handleValidationErrors,
  SolicitudController.create
);

router.put(
  "/:id",
  sanitizeInput,
  getSolicitudValidation,
  handleValidationErrors,
  SolicitudController.update
);

router.delete(
  "/:id",
  requireAdmin,
  sanitizeInput,
  getSolicitudValidation,
  handleValidationErrors,
  SolicitudController.delete
);

module.exports = router;
