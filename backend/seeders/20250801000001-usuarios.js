"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedEmpleadoPassword = await bcrypt.hash("empleado123", 10);

    await queryInterface.bulkInsert("usuarios", [
      {
        username: "admin",
        email: "admin@konecta.com",
        password: hashedAdminPassword,
        rol: "administrador",
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
      {
        username: "empleado",
        email: "empleado@konecta.com",
        password: hashedEmpleadoPassword,
        rol: "empleado",
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", null, {});
  },
};
