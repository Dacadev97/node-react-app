require("./setup");
const request = require("supertest");
const app = require("../server");
const { sequelize } = require("../src/config/database");

describe("REQUERIMIENTO: Autenticación y Autorización JWT", () => {
  let server;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET =
      "bd618b5a9c79d069332219550eea683e44f0b98ff419cb1660bae953b4ae946c27c0ba5ff5d9dfac0192c352ac366491e8846230d274f754f175c486f60fc2d2";
  });

  beforeEach(async () => {
    try {
      await sequelize.query(
        "DELETE FROM usuarios WHERE username LIKE '%test%'"
      );
    } catch (error) {}
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe("Registro e inicio de sesión de usuarios", () => {
    it("debe permitir registro de usuario con datos válidos", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Test123",
        rol: "empleado",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("debe rechazar registro con datos inválidos", async () => {
      const invalidData = {
        username: "te",
        email: "invalid-email",
        password: "123",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("Implementación de JWT para manejar sesiones", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send({
        username: "loginuser",
        email: "login@example.com",
        password: "Login123",
      });
    });

    it("debe generar token JWT válido en login exitoso", async () => {
      const loginData = {
        username: "loginuser",
        password: "Login123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(loginData.username);
      expect(response.body.data.token).toBeDefined();

      const token = response.body.data.token;
      expect(token.split(".").length).toBe(3);
    });

    it("debe rechazar login con credenciales inválidas", async () => {
      const invalidLogin = {
        username: "loginuser",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(invalidLogin)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Credenciales inválidas");
    });
  });

  describe("Roles de usuario diferenciados (administrador, empleado)", () => {
    it("debe permitir crear usuario con rol administrador", async () => {
      const timestamp = Date.now();
      const adminData = {
        username: `adminuser_${timestamp}`,
        email: `admin_${timestamp}@test.com`,
        password: "Admin123",
        rol: "administrador",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(adminData)
        .expect(201);

      expect(response.body.data.user.rol).toBe("administrador");
    });

    it("debe permitir crear usuario con rol empleado", async () => {
      const timestamp = Date.now();
      const empleadoData = {
        username: `empleadouser_${timestamp}`,
        email: `empleado_${timestamp}@test.com`,
        password: "Empleado123",
        rol: "empleado",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(empleadoData)
        .expect(201);

      expect(response.body.data.user.rol).toBe("empleado");
    });

    it("debe usar rol por defecto 'empleado' si no se especifica", async () => {
      const timestamp = Date.now();
      const userData = {
        username: `defaultuser_${timestamp}`,
        email: `default_${timestamp}@test.com`,
        password: "Default123",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.data.user.rol).toBe("empleado");
    });
  });
});

describe("REQUERIMIENTO: Health Check API", () => {
  it("debe responder correctamente al health check", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("API funcionando");
  });

  describe("Manejo de errores de autenticación", () => {
    it("debe manejar error en login con credenciales incorrectas", async () => {
      const credencialesIncorrectas = {
        username: "usuario_inexistente",
        password: "password_incorrecto",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(credencialesIncorrectas)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Credenciales");
    });

    it("debe manejar registro con email duplicado", async () => {
      const userData = {
        username: `user_${Date.now()}`,
        email: `duplicate_${Date.now()}@test.com`,
        password: "Password123",
        rol: "empleado",
      };

      await request(app).post("/api/v1/auth/register").send(userData);

      const duplicateUser = {
        username: `user_different_${Date.now()}`,
        email: userData.email,
        password: "Password123",
        rol: "empleado",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(duplicateUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("ya existe");
    });
  });
});
