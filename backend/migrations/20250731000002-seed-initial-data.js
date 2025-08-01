"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert("usuarios", [
      {
        username: "admin",
        email: "admin@konecta.com",
        password: hashedPassword,
        rol: "administrador",
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("empleados", [
      {
        nombre: "Juan Pérez",
        fecha_ingreso: "2023-01-15",
        salario: 3500000.0,
        activo: true,
      },
      {
        nombre: "María García",
        fecha_ingreso: "2023-03-20",
        salario: 4200000.0,
        activo: false,
      },
      {
        nombre: "Carlos López",
        fecha_ingreso: "2023-05-10",
        salario: 3800000.0,
        activo: true,
      },
    ]);

    await queryInterface.bulkInsert("solicitudes", [
      {
        codigo: "SOL-001",
        descripcion: "Solicitud de vacaciones para el periodo de diciembre",
        resumen: "Vacaciones diciembre",
        id_empleado: 1,
        fecha_creacion: new Date(),
      },
      {
        codigo: "SOL-002",
        descripcion: "Solicitud de permiso médico por cita odontológica",
        resumen: "Permiso médico",
        id_empleado: 2,
        fecha_creacion: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("solicitudes", null, {});
    await queryInterface.bulkDelete("empleados", null, {});
    await queryInterface.bulkDelete("usuarios", null, {});
  },
};
