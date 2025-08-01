require("./setup");
const request = require("supertest");
const app = require("../server");
const { Solicitud, Empleado } = require("../src/models");

describe("Pruebas para Cobertura de ControladorSolicitud", () => {
  let adminToken, empleadoToken, empleadoId;

  beforeAll(async () => {
    const adminData = {
      username: `admin_solicitud_${Date.now()}`,
      email: `admin_solicitud_${Date.now()}@test.com`,
      password: "Admin123",
      rol: "administrador",
    };

    const adminResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(adminData);

    adminToken = adminResponse.body.data.token;

    const empleadoUserData = {
      username: `empleado_solicitud_${Date.now()}`,
      email: `empleado_solicitud_${Date.now()}@test.com`,
      password: "Empleado123",
      rol: "empleado",
    };

    const empleadoResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(empleadoUserData);

    empleadoToken = empleadoResponse.body.data.token;

    const empleadoData = {
      nombre: `Juan Pérez`,
      fecha_ingreso: "2024-01-15",
      salario: 50000.0,
    };

    const empleadoCreateResponse = await request(app)
      .post("/api/v1/empleados")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(empleadoData);

    if (empleadoCreateResponse.status === 201) {
      empleadoId = empleadoCreateResponse.body.data.id;
    } else {
      empleadoId = 1;
    }
  });

  describe("ControladorSolicitud - obtenerPorId", () => {
    it("debe obtener una solicitud por ID", async () => {
      const solicitudData = {
        codigo: `SOL-${Date.now()}`,
        descripcion: "Descripción de prueba para test",
        resumen: "Resumen de prueba",
        id_empleado: empleadoId,
      };

      const createResponse = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data).toBeDefined();
      expect(createResponse.body.data.id).toBeDefined();

      const solicitudId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/solicitudes/${solicitudId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(solicitudId);
      expect(response.body.data.codigo).toBe(solicitudData.codigo);
    });

    it("debe retornar 404 para solicitud inexistente", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Solicitud no encontrada");
    });
  });

  describe("ControladorSolicitud - actualizar", () => {
    it("debe actualizar una solicitud existente", async () => {
      const solicitudData = {
        codigo: `SOL-UPD-${Date.now()}`,
        descripcion: "Descripción original de solicitud",
        resumen: "Resumen original",
        id_empleado: empleadoId,
      };

      const createResponse = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data).toBeDefined();
      expect(createResponse.body.data.id).toBeDefined();

      const solicitudId = createResponse.body.data.id;

      const updateData = {
        descripcion: "Descripción actualizada de la solicitud",
        resumen: "Resumen actualizado",
      };

      const response = await request(app)
        .put(`/api/v1/solicitudes/${solicitudId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.descripcion).toBe(updateData.descripcion);
      expect(response.body.message).toContain("actualizada");
    });

    it("debe retornar 404 al actualizar solicitud inexistente", async () => {
      const updateData = {
        descripcion: "Descripción actualizada de la solicitud",
        resumen: "Resumen actualizado",
      };

      const response = await request(app)
        .put("/api/v1/solicitudes/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Solicitud no encontrada");
    });
  });

  describe("ControladorSolicitud - Validaciones", () => {
    it("debe manejar errores de validación en creación", async () => {
      const solicitudInvalida = {
        codigo: "",
        descripcion: "",
        resumen: "",
        id_empleado: "no-es-numero",
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudInvalida)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("debe validar que el empleado existe al crear solicitud", async () => {
      const solicitudData = {
        codigo: `SOL-INVALID-${Date.now()}`,
        descripcion: "Descripción de prueba para test",
        resumen: "Resumen de prueba",
        id_empleado: 99999,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Empleado no encontrado");
    });

    it("debe manejar código duplicado en solicitudes", async () => {
      const codigoDuplicado = `SOL-DUP-${Date.now()}`;

      const solicitudData1 = {
        codigo: codigoDuplicado,
        descripcion: "Primera solicitud de test",
        resumen: "Primer resumen",
        id_empleado: empleadoId,
      };

      const createResponse1 = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData1)
        .expect(201);

      expect(createResponse1.body.success).toBe(true);

      const solicitudData2 = {
        codigo: codigoDuplicado,
        descripcion: "Segunda solicitud de test",
        resumen: "Segundo resumen",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData2)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "El código de solicitud ya existe"
      );
    });
  });

  describe("Middleware de autenticación - casos límite", () => {
    it("debe manejar token malformado", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes")
        .set("Authorization", "Bearer token-malformado")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Token");
    });

    it("debe manejar token sin Bearer prefix", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes")
        .set("Authorization", adminToken)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("debe manejar header de autorización vacío", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes")
        .set("Authorization", "")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Casos de error del servidor", () => {
    it("debe simular error interno del servidor en empleados", async () => {
      const originalMethod = Empleado.findAndCountAll;
      Empleado.findAndCountAll = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error interno del servidor");

      Empleado.findAndCountAll = originalMethod;
    });

    it("debe simular error interno del servidor en solicitudes", async () => {
      const originalMethod = Solicitud.findAndCountAll;
      Solicitud.findAndCountAll = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error interno del servidor");

      Solicitud.findAndCountAll = originalMethod;
    });
  });
});
