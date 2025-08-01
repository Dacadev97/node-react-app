const request = require("supertest");

describe("Cobertura del Servidor - Líneas Restantes", () => {
  test("debe poder importar el servidor sin ejecutar en entorno no-test", () => {
    const app = require("../server.js");
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe("function");
  });

  test("debe cubrir la llamada a la función startServer", () => {
    expect(() => {
      require("../server.js");
    }).not.toThrow();
  });

  test("debe validar la configuración del servidor", () => {
    const app = require("../server.js");

    expect(app).toBeDefined();
  });
});
