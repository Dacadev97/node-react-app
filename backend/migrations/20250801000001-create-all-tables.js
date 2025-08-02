"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla usuarios
    await queryInterface.createTable("usuarios", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      rol: {
        type: Sequelize.ENUM("administrador", "empleado"),
        allowNull: false,
        defaultValue: "empleado",
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fecha_actualizacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Crear tabla empleados
    await queryInterface.createTable("empleados", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      fecha_ingreso: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      salario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fecha_actualizacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Crear tabla solicitudes
    await queryInterface.createTable("solicitudes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      resumen: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      empleado_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "empleados",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fecha_actualizacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Crear índices para mejorar rendimiento
    await queryInterface.addIndex("usuarios", ["email"]);
    await queryInterface.addIndex("usuarios", ["username"]);
    await queryInterface.addIndex("empleados", ["activo"]);
    await queryInterface.addIndex("solicitudes", ["codigo"]);
    await queryInterface.addIndex("solicitudes", ["empleado_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("solicitudes");
    await queryInterface.dropTable("empleados");
    await queryInterface.dropTable("usuarios");
  },
};
