"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("empleados", [
      {
        nombre: "Juan Pérez",
        fecha_ingreso: "2023-01-15",
        salario: 3500000.00,
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
      {
        nombre: "María García",
        fecha_ingreso: "2023-03-20",
        salario: 4200000.00,
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
      {
        nombre: "Carlos López",
        fecha_ingreso: "2023-05-10",
        salario: 3800000.00,
        activo: false,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
      {
        nombre: "Ana Rodríguez",
        fecha_ingreso: "2023-07-01",
        salario: 4500000.00,
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
      {
        nombre: "Luis Martínez",
        fecha_ingreso: "2023-08-15",
        salario: 3200000.00,
        activo: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("empleados", null, {});
  },
};
