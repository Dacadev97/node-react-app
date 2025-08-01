const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Solicitud = sequelize.define(
  "Solicitud",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],
        notEmpty: true,
      },
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [5, 255],
        notEmpty: true,
      },
    },
    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "empleados",
        key: "id",
      },
    },
  },
  {
    tableName: "solicitudes",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: false,
  }
);

module.exports = Solicitud;
