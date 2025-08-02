"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("solicitudes", [
      {
        codigo: "SOL-2024-001",
        descripcion: "Solicitud de aumento de salario debido al excelente desempeño durante el último trimestre. Se adjunta evaluación de rendimiento y comparativo salarial del mercado.",
        resumen: "Solicitud de aumento salarial",
        empleado_id: 1,
        fecha_creacion: new Date("2024-01-15"),
        fecha_actualizacion: new Date("2024-01-15"),
      },
      {
        codigo: "SOL-2024-002",
        descripcion: "Solicitud de días de vacaciones adicionales para el mes de marzo debido a compromisos familiares importantes. Se propone compensar con trabajo extra en febrero.",
        resumen: "Solicitud de vacaciones adicionales",
        empleado_id: 2,
        fecha_creacion: new Date("2024-02-10"),
        fecha_actualizacion: new Date("2024-02-10"),
      },
      {
        codigo: "SOL-2024-003",
        descripcion: "Solicitud de cambio de horario laboral para poder tomar cursos de especialización en las tardes. Se mantendría la misma cantidad de horas laborales.",
        resumen: "Cambio de horario laboral",
        empleado_id: 4,
        fecha_creacion: new Date("2024-03-05"),
        fecha_actualizacion: new Date("2024-03-05"),
      },
      {
        codigo: "SOL-2024-004",
        descripcion: "Solicitud de trabajo remoto dos días a la semana para mejorar la productividad y reducir tiempos de desplazamiento. Se incluye propuesta de seguimiento y métricas.",
        resumen: "Trabajo remoto parcial",
        empleado_id: 5,
        fecha_creacion: new Date("2024-03-20"),
        fecha_actualizacion: new Date("2024-03-20"),
      },
      {
        codigo: "SOL-2024-005",
        descripcion: "Solicitud de capacitación en nuevas tecnologías para el desarrollo profesional. Se propone asistir a conferencia internacional de la industria.",
        resumen: "Capacitación profesional",
        empleado_id: 1,
        fecha_creacion: new Date("2024-04-01"),
        fecha_actualizacion: new Date("2024-04-01"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("solicitudes", null, {});
  },
};
