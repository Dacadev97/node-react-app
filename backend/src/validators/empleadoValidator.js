const { body, param, query } = require("express-validator");

const createEmpleadoValidation = [
  body("nombre")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("fecha_ingreso")
    .isISO8601()
    .withMessage("La fecha de ingreso debe ser una fecha válida (YYYY-MM-DD)")
    .custom((value) => {
      const fechaIngreso = new Date(value);
      const hoy = new Date();
      if (fechaIngreso > hoy) {
        throw new Error("La fecha de ingreso no puede ser futura");
      }
      return true;
    }),

  body("salario")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El salario debe ser un número positivo"),
];

const getEmpleadoValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID del empleado debe ser un número entero positivo"),
];

const queryValidation = [
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
    .isIn(["id", "nombre", "fecha_ingreso", "salario", "activo"])
    .withMessage("Campo de ordenamiento inválido"),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("Orden debe ser ASC o DESC"),

  query("activo")
    .optional()
    .isIn(["true", "false", ""])
    .withMessage("El campo activo debe ser true, false o vacío"),

  query("search")
    .optional()
    .isLength({ min: 0, max: 100 })
    .withMessage("La búsqueda no puede exceder 100 caracteres"),
];

module.exports = {
  createEmpleadoValidation,
  getEmpleadoValidation,
  queryValidation,
};
