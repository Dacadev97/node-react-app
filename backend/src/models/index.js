const Usuario = require("./Usuario");
const Empleado = require("./Empleado");
const Solicitud = require("./Solicitud");

Empleado.hasMany(Solicitud, {
  foreignKey: "id_empleado",
  as: "solicitudes",
});

Solicitud.belongsTo(Empleado, {
  foreignKey: "id_empleado",
  as: "empleado",
});

module.exports = {
  Usuario,
  Empleado,
  Solicitud,
};
