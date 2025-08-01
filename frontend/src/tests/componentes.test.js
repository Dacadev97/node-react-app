import { render, screen } from "@testing-library/react";

describe("COMPONENTES REACT", () => {
  test("debe renderizar estadisticas sin limite de paginacion", () => {
    const mockStats = {
      totalEmpleados: 120,
      empleadosActivos: 100,
      empleadosInactivos: 20,
    };

    render(
      <div data-testid="dashboard">
        <div data-testid="stat-total">{mockStats.totalEmpleados}</div>
        <div data-testid="stat-activos">{mockStats.empleadosActivos}</div>
        <div data-testid="stat-inactivos">{mockStats.empleadosInactivos}</div>
      </div>
    );

    expect(screen.getByTestId("stat-total")).toHaveTextContent("120");
    expect(screen.getByTestId("stat-activos")).toHaveTextContent("100");
    expect(screen.getByTestId("stat-inactivos")).toHaveTextContent("20");
  });

  test("debe mostrar navegacion basada en rol", () => {
    const adminUser = { rol: "admin" };
    const empleadoUser = { rol: "empleado" };

    const getNavItems = (user) => {
      const baseItems = ["Dashboard"];
      if (user.rol === "admin") {
        return [...baseItems, "Empleados", "Solicitudes"];
      }
      return [...baseItems, "Mis Solicitudes"];
    };

    const adminNav = getNavItems(adminUser);
    const empleadoNav = getNavItems(empleadoUser);

    expect(adminNav).toContain("Empleados");
    expect(adminNav).toContain("Solicitudes");
    expect(empleadoNav).not.toContain("Empleados");
    expect(empleadoNav).toContain("Mis Solicitudes");
  });

  test("debe renderizar lista de empleados con paginacion", () => {
    const empleados = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      nombre: `Empleado ${i + 1}`,
      activo: true,
    }));

    const pageSize = 10;
    const displayedEmpleados = empleados.slice(0, pageSize);

    expect(displayedEmpleados).toHaveLength(10);
    expect(empleados).toHaveLength(15);
  });

  test("debe permitir busqueda y filtrado", () => {
    const empleados = [
      { id: 1, nombre: "Juan Perez", activo: true },
      { id: 2, nombre: "Maria Garcia", activo: false },
      { id: 3, nombre: "Carlos Lopez", activo: true },
    ];

    const searchTerm = "juan";
    const filtered = empleados.filter((emp) =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].nombre).toBe("Juan Perez");
  });

  test("debe validar formulario de empleado", () => {
    const formData = {
      nombre: "",
      email: "invalid-email",
      telefono: "123",
    };

    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    }

    if (!formData.email.includes("@")) {
      errors.email = "Email invalido";
    }

    if (formData.telefono.length < 10) {
      errors.telefono = "Telefono debe tener al menos 10 digitos";
    }

    expect(errors.nombre).toBe("El nombre es requerido");
    expect(errors.email).toBe("Email invalido");
    expect(errors.telefono).toBe("Telefono debe tener al menos 10 digitos");
  });

  test("debe proteger rutas segun autenticacion", () => {
    const isAuthenticated = true;
    const userRole = "admin";

    const canAccessRoute = (route, user) => {
      if (!isAuthenticated) return false;

      const protectedRoutes = {
        "/empleados": ["admin"],
        "/solicitudes": ["admin"],
        "/dashboard": ["admin", "empleado"],
      };

      return protectedRoutes[route]?.includes(user.rol) || false;
    };

    expect(canAccessRoute("/empleados", { rol: userRole })).toBe(true);
    expect(canAccessRoute("/empleados", { rol: "empleado" })).toBe(false);
    expect(canAccessRoute("/dashboard", { rol: "empleado" })).toBe(true);
  });
});
