require("dotenv").config();

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET;
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

process.env.DB_HOST = process.env.DB_HOST;
process.env.DB_PORT = process.env.DB_PORT;
process.env.DB_NAME = process.env.DB_NAME;
process.env.DB_USER = process.env.DB_USER;
process.env.DB_PASSWORD = process.env.DB_PASSWORD;

jest.setTimeout(30000);

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(async () => {
  const { sequelize } = require("../src/config/database");

  try {
    await sequelize.authenticate();

    await sequelize.sync({ force: false });

    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  } catch (error) {
    console.error("Error configurando base de datos para tests:", error);
    throw error;
  }
});

afterAll(async () => {
  const { sequelize } = require("../src/config/database");
  await sequelize.close();
});
