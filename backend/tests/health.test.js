require("./setup");
const request = require("supertest");
const app = require("../server");

describe("Verificación de Estado y Rutas del Sistema", () => {
  describe("Verificación de Estado", () => {
    it("debe responder al verificador de estado correctamente", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("API funcionando");
    });
  });

  describe("Rutas principales del sistema", () => {
    it("debe responder correctamente en la ruta raíz /", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("API Konecta");
      expect(response.body.version).toBe("1.0.0");
      expect(response.body.documentation).toBe("/api/v1/health");
    });

    it("debe retornar 404 para rutas no encontradas", async () => {
      const response = await request(app).get("/ruta-inexistente").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Ruta no encontrada");
    });

    it("debe retornar 404 para POST en ruta inexistente", async () => {
      const response = await request(app)
        .post("/api/v1/ruta-inexistente")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Ruta no encontrada");
    });
  });
});
