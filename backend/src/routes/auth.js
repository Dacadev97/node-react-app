const express = require("express");
const AuthController = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidator");
const {
  handleValidationErrors,
  sanitizeInput,
} = require("../middleware/validation");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  sanitizeInput,
  registerValidation,
  handleValidationErrors,
  AuthController.register
);

router.post(
  "/login",
  sanitizeInput,
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

router.get("/profile", verifyToken, AuthController.getProfile);

module.exports = router;
