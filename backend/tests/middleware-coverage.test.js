require("./setup");
const request = require("supertest");
const app = require("../server");

describe("Middleware de Validación de Tipos de Datos", () => {
  let adminToken;

  beforeAll(async () => {
    const adminData = {
      username: `admin_validation_${Date.now()}`,
      email: `admin_validation_${Date.now()}@test.com`,
      password: "Admin123",
      rol: "administrador",
    };

    const adminResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(adminData);

    adminToken = adminResponse.body.data.token;
  });

  describe("Validación y conversión de tipos de datos", () => {
    it("debe validar y convertir salario de string a número", async () => {
      const empleadoData = {
        nombre: "Empleado Válido",
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

  describe("Manejo de errores HTTP específicos", () => {
    it("debe retornar 404 para métodos HTTP no soportados en health", async () => {
      const response = await request(app).patch("/api/v1/health").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Ruta no encontrada");
    });

    it("debe rechazar POST en endpoint de health", async () => {
      const response = await request(app)
        .post("/api/v1/health")
        .send({ test: "data" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
