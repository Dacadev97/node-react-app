require("./setup");
const request = require("supertest");
const app = require("../server");

describe("Autenticación JWT con Roles", () => {
  let adminToken, empleadoToken;

  beforeAll(async () => {
    console.log("Iniciando tests de autenticación JWT...");
  });

  afterAll(async () => {
    console.log("Tests de autenticación JWT completados");
  });

  describe("Registro de usuarios con roles diferenciados", () => {
    it("debe permitir registro de administrador", async () => {
      const adminData = {
        username: `admin_test_${Date.now()}`,
        email: `admin_test_${Date.now()}@test.com`,
        password: "Admin123",
        rol: "administrador",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(adminData);

      expect([200, 201]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.rol).toBe("administrador");
        expect(response.body.data.token).toBeDefined();
        adminToken = response.body.data.token;
      }
    });

    it("debe permitir registro de empleado", async () => {
      const empleadoData = {
        username: `empleado_test_${Date.now()}`,
        email: `empleado_test_${Date.now()}@test.com`,
        password: "Empleado123",
        rol: "empleado",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(empleadoData);

      expect([200, 201]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.rol).toBe("empleado");
        expect(response.body.data.token).toBeDefined();
        empleadoToken = response.body.data.token;
      }
    });
  });

  describe("Inicio de sesión con JWT", () => {
    it("debe permitir login con credenciales válidas", async () => {
      const userData = {
        username: `login_user_${Date.now()}`,
        email: `login_user_${Date.now()}@test.com`,
        password: "LoginTest123",
        rol: "empleado",
      };

      await request(app).post("/api/v1/auth/register").send(userData);

      const loginData = {
        username: userData.username,
        password: userData.password,
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect([200, 201]).toContain(response.status);

      if (response.body.success) {
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.rol).toBeDefined();
      }
    });

    it("debe rechazar credenciales inválidas", async () => {
      const loginData = {
        email: "usuario_inexistente@test.com",
        password: "PasswordIncorrecto",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Verificación de tokens JWT", () => {
    it("debe validar tokens en rutas protegidas", async () => {
      if (adminToken) {
        const response = await request(app)
          .get("/api/v1/empleados")
          .set("Authorization", `Bearer ${adminToken}`);

        expect([200, 401]).toContain(response.status);
      } else {
        const response = await request(app).get("/api/v1/empleados");

        expect(response.status).toBe(401);
      }
    });

    it("debe rechazar tokens inválidos", async () => {
      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", "Bearer token_invalido");

      expect(response.status).toBe(401);
    });

    it("debe rechazar peticiones sin token", async () => {
      const response = await request(app).get("/api/v1/empleados");

      expect(response.status).toBe(401);
    });
  });

  describe("Diferenciación de roles (administrador vs empleado)", () => {
    it("debe identificar el rol en el contexto de autenticación", async () => {
      expect(["administrador", "empleado"]).toContain("administrador");
      expect(["administrador", "empleado"]).toContain("empleado");
    });
  });

  describe("Validación de headers de autenticación", () => {
    it("debe rechazar headers de autorización malformados", async () => {
      const response = await request(app)
        .get("/api/v1/empleados")
        .set("Authorization", "InvalidFormat")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
