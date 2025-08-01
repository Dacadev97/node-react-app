const { Solicitud, Empleado } = require("../models");
const { Op } = require("sequelize");

class SolicitudController {
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        id_empleado = null,
        sortBy = "fecha_creacion",
        sortOrder = "DESC",
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereConditions = {};

      if (search) {
        whereConditions[Op.or] = [
          { codigo: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } },
          { resumen: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (id_empleado) {
        whereConditions.id_empleado = parseInt(id_empleado);
      }

      const { count, rows: solicitudes } = await Solicitud.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: Empleado,
            as: "empleado",
            attributes: ["id", "nombre"],
          },
        ],
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        success: true,
        data: {
          solicitudes,
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
      console.error("Error en getAll solicitudes:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const solicitud = await Solicitud.findByPk(id, {
        include: [
          {
            model: Empleado,
            as: "empleado",
            attributes: ["id", "nombre"],
          },
        ],
      });

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada",
        });
      }

      res.json({
        success: true,
        data: solicitud,
      });
    } catch (error) {
      console.error("Error en getById solicitud:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async create(req, res) {
    try {
      const { codigo, descripcion, resumen, id_empleado } = req.body;

      const empleado = await Empleado.findByPk(id_empleado);
      if (!empleado) {
        return res.status(400).json({
          success: false,
          message: "Empleado no encontrado",
          errors: [
            {
              field: "id_empleado",
              message: "El empleado especificado no existe",
              value: id_empleado,
            },
          ],
        });
      }

      const solicitud = await Solicitud.create({
        codigo,
        descripcion,
        resumen,
        id_empleado,
      });

      const solicitudCompleta = await Solicitud.findByPk(solicitud.id, {
        include: [
          {
            model: Empleado,
            as: "empleado",
            attributes: ["id", "nombre"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Solicitud creada exitosamente",
        data: solicitudCompleta,
      });
    } catch (error) {
      console.error("Error en create solicitud:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "El código de solicitud ya existe",
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
      const { codigo, descripcion, resumen, id_empleado } = req.body;

      const solicitud = await Solicitud.findByPk(id);

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada",
        });
      }

      if (id_empleado && id_empleado !== solicitud.id_empleado) {
        const empleado = await Empleado.findByPk(id_empleado);
        if (!empleado) {
          return res.status(400).json({
            success: false,
            message: "Empleado no encontrado",
          });
        }
      }

      await solicitud.update({
        codigo: codigo || solicitud.codigo,
        descripcion: descripcion || solicitud.descripcion,
        resumen: resumen || solicitud.resumen,
        id_empleado: id_empleado || solicitud.id_empleado,
      });

      const solicitudActualizada = await Solicitud.findByPk(id, {
        include: [
          {
            model: Empleado,
            as: "empleado",
            attributes: ["id", "nombre"],
          },
        ],
      });

      res.json({
        success: true,
        message: "Solicitud actualizada exitosamente",
        data: solicitudActualizada,
      });
    } catch (error) {
      console.error("Error en update solicitud:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "El código de solicitud ya existe",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const solicitud = await Solicitud.findByPk(id);
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada",
        });
      }

      await solicitud.destroy();

      res.json({
        success: true,
        message: "Solicitud eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error en delete solicitud:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

module.exports = SolicitudController;
