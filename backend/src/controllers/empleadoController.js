const { Empleado } = require("../models");
const { Op } = require("sequelize");

class EmpleadoController {
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        activo = "",
        sortBy = "id",
        sortOrder = "ASC",
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const whereConditions = {};

      if (search) {
        whereConditions[Op.or] = [{ nombre: { [Op.iLike]: `%${search}%` } }];
      }

      if (activo !== "") {
        whereConditions.activo = activo === "true";
      }

      const { count, rows: empleados } = await Empleado.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        success: true,
        data: {
          empleados,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error en getAll empleados:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: "Empleado no encontrado",
        });
      }

      res.json({
        success: true,
        data: empleado,
      });
    } catch (error) {
      console.error("Error en Id empleado:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, fecha_ingreso, salario, activo = true } = req.body;

      const empleado = await Empleado.create({
        nombre,
        fecha_ingreso,
        salario,
        activo,
      });

      res.status(201).json({
        success: true,
        message: "Empleado creado exitosamente",
        data: empleado,
      });
    } catch (error) {
      console.error("Error en create empleado:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
          })),
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, fecha_ingreso, salario, activo } = req.body;

      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: "Empleado no encontrado",
        });
      }

      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (fecha_ingreso !== undefined) updateData.fecha_ingreso = fecha_ingreso;
      if (salario !== undefined) updateData.salario = salario;
      if (activo !== undefined) updateData.activo = activo;

      await empleado.update(updateData);

      res.json({
        success: true,
        message: "Empleado actualizado exitosamente",
        data: empleado,
      });
    } catch (error) {
      console.error("Error en update empleado:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async getStats(req, res) {
    try {
      const totalEmpleados = await Empleado.count();
      const empleadosActivos = await Empleado.count({
        where: { activo: true },
      });
      const empleadosInactivos = await Empleado.count({
        where: { activo: false },
      });

      res.json({
        success: true,
        data: {
          totalEmpleados,
          empleadosActivos,
          empleadosInactivos,
        },
      });
    } catch (error) {
      console.error("Error en getStats empleados:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: "Empleado no encontrado",
        });
      }

      await empleado.destroy();

      res.json({
        success: true,
        message: "Empleado eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en delete empleado:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

module.exports = EmpleadoController;
