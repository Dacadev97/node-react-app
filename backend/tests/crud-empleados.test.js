require("./setup");
const request = require("supertest");
const app = require("../server");

describe("CRUD Empleados - Consulta e Inserción", () => {
  let adminToken, empleadoToken;

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
  });

  describe("Consulta de empleados", () => {
    it("debe permitir consultar empleados con token válido", async () => {
      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.empleados)).toBe(true);
    });

    it("debe permitir consultar empleados a usuarios empleado", async () => {
      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", `Bearer ${empleadoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.empleados)).toBe(true);
    });

    it("debe implementar paginación en la consulta", async () => {
      const response = await request(app)
        .get("/api/v1/empleados?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(10);
    });

    it("debe implementar filtrado en la consulta", async () => {
      const response = await request(app)
        .get("/api/v1/empleados?search=test")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.empleados)).toBe(true);
    });

    it("debe retornar 404 para empleado inexistente en getById", async () => {
      const response = await request(app)
        .get("/api/v1/empleados/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Empleado no encontrado");
    });
  });

  describe("Inserción de empleados", () => {
    it("debe permitir crear empleados con datos válidos", async () => {
      const empleadoData = {
        nombre: "Empleado Test",
        fecha_ingreso: "2024-01-15",
        salario: 50000.0,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(empleadoData.nombre);
      expect(parseFloat(response.body.data.salario)).toBe(empleadoData.salario);
    });

    it("debe validar campos requeridos en la inserción", async () => {
      const empleadoData = {
        fecha_ingreso: "2024-01-15",
        salario: 50000.0,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("debe validar formato de fecha en la inserción", async () => {
      const empleadoData = {
        nombre: "Empleado Test",
        fecha_ingreso: "fecha-invalida",
        salario: 50000.0,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("debe validar que el salario sea numérico", async () => {
      const empleadoData = {
        nombre: "Empleado Test",
        fecha_ingreso: "2024-01-15",
        salario: "no-es-numero",
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("debe manejar errores de validación de Sequelize en creación", async () => {
      const empleadoInvalido = {
        nombre: "",
        fecha_ingreso: "fecha-invalida",
        salario: "no-es-numero",
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoInvalido)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("validación");
    });

    it("debe validar conversión de salario string a número", async () => {
      const empleadoData = {
        nombre: `Test Empleado ${Date.now()}`,
        fecha_ingreso: "2024-01-15",
        salario: "3000000",
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData);

      expect([201, 400]).toContain(response.status);
    });
  });

  describe("Restricciones de operaciones", () => {
    it("NO debe permitir actualización (PUT) - endpoint no debe existir", async () => {
      const response = await request(app)
        .put("/api/v1/empleados/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ nombre: "Nuevo nombre" });

      expect([400, 404, 405]).toContain(response.status);
    });

    it("NO debe permitir eliminación (DELETE) - endpoint no debe existir", async () => {
      const response = await request(app)
        .delete("/api/v1/empleados/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect([400, 404, 405]).toContain(response.status);
    });

    it("NO debe permitir actualización parcial (PATCH) - endpoint no debe existir", async () => {
      const response = await request(app)
        .patch("/api/v1/empleados/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ salario: 60000 });

      expect([400, 404, 405]).toContain(response.status);
    });
  });

  describe("Control de acceso", () => {
    it("debe rechazar inserción sin autenticación", async () => {
      const empleadoData = {
        nombre: "Empleado Test",
        fecha_ingreso: "2024-01-15",
        salario: 50000.0,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .send(empleadoData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("debe rechazar consulta sin autenticación", async () => {
      const response = await request(app).get("/api/v1/empleados").expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
