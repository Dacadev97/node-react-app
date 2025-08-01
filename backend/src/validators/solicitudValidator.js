const { body, param, query } = require("express-validator");

const createSolicitudValidation = [
  body("codigo")
    .isLength({ min: 3, max: 50 })
    .withMessage("El código debe tener entre 3 y 50 caracteres")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage(
      "El código solo puede contener letras mayúsculas, números y guiones"
    ),

  body("descripcion")
    .isLength({ min: 10, max: 1000 })
    .withMessage("La descripción debe tener entre 10 y 1000 caracteres"),

  body("resumen")
    .isLength({ min: 5, max: 255 })
    .withMessage("El resumen debe tener entre 5 y 255 caracteres"),

  body("id_empleado")
    .isInt({ min: 1 })
    .withMessage("El ID del empleado debe ser un número entero positivo"),
];

const getSolicitudValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID de la solicitud debe ser un número entero positivo"),
];

const querySolicitudValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),

  query("sortBy")
    .optional()
    .isIn(["id", "codigo", "descripcion", "resumen", "fecha_creacion"])
    .withMessage("Campo de ordenamiento inválido"),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("Orden debe ser ASC o DESC"),

  query("id_empleado")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del empleado debe ser un número entero positivo"),
];

module.exports = {
  createSolicitudValidation,
  getSolicitudValidation,
  querySolicitudValidation,
};
