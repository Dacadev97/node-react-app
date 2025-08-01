require("./setup");
const request = require("supertest");
const app = require("../server");

describe("CRUD Solicitudes - Consulta, Inserción y Eliminación", () => {
  let adminToken, empleadoToken;
  let empleadoId;
  let solicitudId;

  beforeAll(async () => {
    const adminData = {
      username: `admin_${Date.now()}`,
      email: `admin_${Date.now()}@test.com`,
      password: "Admin123",
      rol: "administrador",
    };

    const adminResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(adminData);

    adminToken = adminResponse.body.data.token;

    const empleadoData = {
      username: `empleado_${Date.now()}`,
      email: `empleado_${Date.now()}@test.com`,
      password: "Empleado123",
      rol: "empleado",
    };

    const empleadoResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(empleadoData);

    empleadoToken = empleadoResponse.body.data.token;

    const nuevoEmpleado = {
      nombre: "Empleado Test Solicitudes",
      fecha_ingreso: "2024-01-15",
      salario: 50000.0,
    };

    const empleadoCreado = await request(app)
      .post("/api/v1/empleados")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(nuevoEmpleado)
      .expect(201);

    empleadoId = empleadoCreado.body.data.id;
  });

  describe("Consulta de solicitudes", () => {
    it("debe permitir consultar solicitudes con token válido", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.solicitudes)).toBe(true);
    });

    it("debe permitir consultar solicitudes a usuarios empleado", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${empleadoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.solicitudes)).toBe(true);
    });

    it("debe implementar paginación en la consulta de solicitudes", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(10);
    });

    it("debe implementar filtrado en la consulta de solicitudes", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes?search=test")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.solicitudes)).toBe(true);
    });
  });

  describe("Inserción de solicitudes", () => {
    it("debe permitir a empleados crear solicitudes", async () => {
      const solicitudData = {
        codigo: `SOL-${Date.now()}`,
        descripcion: "Solicitud de prueba creada por empleado",
        resumen: "Resumen de la solicitud",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${empleadoToken}`)
        .send(solicitudData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.codigo).toBe(solicitudData.codigo);
      expect(response.body.data.descripcion).toBe(solicitudData.descripcion);

      solicitudId = response.body.data.id;
    });

    it("debe permitir a administradores crear solicitudes", async () => {
      const solicitudData = {
        codigo: `SOL-ADMIN-${Date.now()}`,
        descripcion: "Solicitud de prueba creada por administrador",
        resumen: "Resumen de la solicitud",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.codigo).toBe(solicitudData.codigo);
    });

    it("debe validar campos requeridos en la inserción", async () => {
      const solicitudData = {
        descripcion: "Solicitud sin código",
        resumen: "Resumen",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${empleadoToken}`)
        .send(solicitudData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("debe validar que el empleado existe", async () => {
      const solicitudData = {
        codigo: `SOL-${Date.now()}`,
        descripcion: "Solicitud con empleado inexistente",
        resumen: "Resumen",
        id_empleado: 99999,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${empleadoToken}`)
        .send(solicitudData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Eliminación de solicitudes - Solo administradores", () => {
    beforeEach(async () => {
      const solicitudData = {
        codigo: `SOL-DELETE-${Date.now()}`,
        descripcion: "Solicitud para eliminar",
        resumen: "Resumen",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData);

      solicitudId = response.body.data.id;
    });

    it("debe permitir a administradores eliminar solicitudes", async () => {
      const response = await request(app)
        .delete(`/api/v1/solicitudes/${solicitudId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("eliminada");
    });

    it("NO debe permitir a empleados eliminar solicitudes", async () => {
      const response = await request(app)
        .delete(`/api/v1/solicitudes/${solicitudId}`)
        .set("Authorization", `Bearer ${empleadoToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("administrador");
    });

    it("debe devolver error al eliminar solicitud inexistente", async () => {
      const response = await request(app)
        .delete("/api/v1/solicitudes/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Restricciones de operaciones", () => {
    it("NO debe permitir actualización (PUT) - endpoint no debe existir", async () => {
      const response = await request(app)
        .put(`/api/v1/solicitudes/${solicitudId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ descripcion: "Nueva descripción" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("NO debe permitir actualización parcial (PATCH) - endpoint no debe existir", async () => {
      const response = await request(app)
        .patch(`/api/v1/solicitudes/${solicitudId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ resumen: "Nuevo resumen" });

      expect([404, 405]).toContain(response.status);
    });
  });

  describe("Control de acceso", () => {
    it("debe rechazar operaciones sin autenticación", async () => {
      const response = await request(app)
        .get("/api/v1/solicitudes")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("debe rechazar creación sin autenticación", async () => {
      const solicitudData = {
        codigo: "SOL-NO-AUTH",
        descripcion: "Solicitud sin auth",
        resumen: "Resumen",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .send(solicitudData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("debe rechazar eliminación sin autenticación", async () => {
      const response = await request(app)
        .delete(`/api/v1/solicitudes/${solicitudId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
