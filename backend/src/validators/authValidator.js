const { body } = require("express-validator");

const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre de usuario debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "El nombre de usuario solo puede contener letras, números y guiones bajos"
    ),

  body("email")
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número"
    ),

  body("rol")
    .optional()
    .isIn(["administrador", "empleado"])
    .withMessage('El rol debe ser "administrador" o "empleado"'),
];

const loginValidation = [
  body("username").notEmpty().withMessage("El nombre de usuario es requerido"),

  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

module.exports = {
  registerValidation,
  loginValidation,
};
