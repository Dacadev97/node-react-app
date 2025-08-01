const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<[^>]*>?/gm, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "")
          .replace(/alert\s*\(/gi, "")
          .replace(/eval\s*\(/gi, "")
          .replace(/confirm\s*\(/gi, "")
          .replace(/prompt\s*\(/gi, "")
          .trim();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors.map((error) => ({
        field: error.path,
        message: error.message,
      })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "El registro ya existe",
      field: err.errors[0]?.path,
    });
  }

  if (err.name === "SequelizeDatabaseError") {
    return res.status(500).json({
      success: false,
      message: "Error de base de datos",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  errorHandler,
};
