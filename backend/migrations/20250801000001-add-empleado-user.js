"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPasswordEmpleado = await bcrypt.hash("empleado123", 10);

    await queryInterface.bulkInsert("usuarios", [
      {
        username: "empleado",
        email: "empleado@konecta.com",
        password: hashedPasswordEmpleado,
        rol: "empleado",
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", {
      username: "empleado"
    }, {});
  },
};
