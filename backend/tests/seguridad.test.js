require("./setup");
const request = require("supertest");
const app = require("../server");

describe("Seguridad - SQL Injection y XSS", () => {
  let adminToken;

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
  });

  describe("Prevención de SQL Injection", () => {
    it("debe prevenir SQL injection en consulta de empleados", async () => {
      const maliciousQuery = "'; DROP TABLE Empleado; --";

      const response = await request(app)
        .get(`/api/v1/empleados?search=${encodeURIComponent(maliciousQuery)}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.empleados)).toBe(true);
    });

    it("debe prevenir SQL injection en parámetros de filtrado", async () => {
      const maliciousParam = "1' OR '1'='1";

      const response = await request(app)
        .get(`/api/v1/empleados?id=${encodeURIComponent(maliciousParam)}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("debe prevenir SQL injection en creación de empleados", async () => {
      const maliciousData = {
        nombre: "'; DROP TABLE Empleado; --",
        fecha_ingreso: "2024-01-15",
        salario: 50000,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(maliciousData);

      if (response.status === 201) {
        expect(response.body.data.nombre).toBe(maliciousData.nombre);
      } else {
        expect(response.status).toBe(400);
      }
    });

    it("debe prevenir SQL injection en consulta de solicitudes", async () => {
      const maliciousQuery = "'; SELECT * FROM Usuario; --";

      const response = await request(app)
        .get(`/api/v1/solicitudes?search=${encodeURIComponent(maliciousQuery)}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.solicitudes)).toBe(true);
    });
  });

  describe("Prevención de XSS", () => {
    it("debe sanitizar scripts en nombre de empleado", async () => {
      const xssPayload = "<script>alert('XSS')</script>";
      const empleadoData = {
        nombre: `Empleado ${xssPayload}`,
        fecha_ingreso: "2024-01-15",
        salario: 50000,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData);

      if (response.status === 201) {
        expect(response.body.data.nombre).not.toContain("<script>");
        expect(response.body.data.nombre).not.toContain("alert(");
      } else {
        expect(response.status).toBe(400);
      }
    });

    it("debe sanitizar HTML en descripción de solicitudes", async () => {
      const empleadoData = {
        nombre: "Empleado Test",
        fecha_ingreso: "2024-01-15",
        salario: 50000,
      };

      const empleadoResponse = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData);

      const empleadoId = empleadoResponse.body.data.id;

      const xssPayload = "<img src=x onerror=alert('XSS')>";
      const solicitudData = {
        codigo: `SOL-${Date.now()}`,
        descripcion: `Descripción con XSS: ${xssPayload}`,
        resumen: "Resumen normal",
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData);

      if (response.status === 201) {
        expect(response.body.data.descripcion).not.toContain("<img");
        expect(response.body.data.descripcion).not.toContain("onerror");
      } else {
        expect(response.status).toBe(400);
      }
    });

    it("debe sanitizar JavaScript en resumen de solicitudes", async () => {
      const empleadoData = {
        nombre: "Empleado Test Seguridad",
        fecha_ingreso: "2024-01-15",
        salario: 50000,
      };

      const empleadoResponse = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData)
        .expect(201);

      const empleadoId = empleadoResponse.body.data.id;

      const xssPayload = "javascript:alert('XSS')";
      const solicitudData = {
        codigo: `SOL-JS-TEST-${Date.now()}`,
        descripcion: "Descripción normal",
        resumen: `Resumen con JS: ${xssPayload}`,
        id_empleado: empleadoId,
      };

      const response = await request(app)
        .post("/api/v1/solicitudes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(solicitudData);

      if (response.status === 201) {
        expect(response.body.data.resumen).not.toContain("javascript:");
        expect(response.body.data.resumen).not.toContain("alert(");
      } else {
        expect(response.status).toBe(400);
      }
    });

    it("debe sanitizar contenido en arrays", async () => {
      const dataConArray = {
        nombre: "Empleado Test",
        fecha_ingreso: "2024-01-15",
        salario: 3000000,
        tags: ["<script>", "javascript:alert('test')", "normal"],
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(dataConArray);

      expect([201, 400]).toContain(response.status);
    });
  });

  describe("Validación de entrada", () => {
    it("debe validar y rechazar emails malformados", async () => {
      const userData = {
        username: `user_${Date.now()}`,
        email: "email-malformado",
        password: "Test123",
        rol: "empleado",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("debe validar y rechazar passwords débiles", async () => {
      const userData = {
        username: `user_${Date.now()}`,
        email: `user_${Date.now()}@test.com`,
        password: "123",
        rol: "empleado",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("debe validar tipos de datos en salario", async () => {
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

    it("debe validar formato de fecha", async () => {
      const empleadoData = {
        nombre: "Empleado Test",
        fecha_ingreso: "fecha-invalida",
        salario: 50000,
      };

      const response = await request(app)
        .post("/api/v1/empleados")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(empleadoData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Seguridad de tokens JWT", () => {
    it("debe rechazar tokens malformados", async () => {
      const malformedToken = "Bearer token.malformado.aqui";

      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", malformedToken)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("debe rechazar tokens expirados o inválidos", async () => {
      const invalidToken =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", invalidToken)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("debe rechazar tokens sin el prefijo Bearer", async () => {
      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", adminToken)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
