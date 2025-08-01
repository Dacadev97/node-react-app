const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");
const { Op } = require("sequelize");

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, rol = "empleado" } = req.body;

      const existingUser = await Usuario.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "El usuario ya existe",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const usuario = await Usuario.create({
        username,
        email,
        password: hashedPassword,
        rol,
      });

      const token = jwt.sign(
        {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          user: {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error en register:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const usuario = await Usuario.findOne({
        where: { username, activo: true },
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      const isValidPassword = await bcrypt.compare(password, usuario.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          user: {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      console.error("Error en getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

module.exports = AuthController;
