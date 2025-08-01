import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Empleados from "../pages/Empleados";

const mockEmpleados = [
  {
    id: 1,
    nombre: "Juan Pérez",
    fecha_ingreso: "2023-01-14",
    salario: 3500000,
    activo: true,
  },
  {
    id: 2,
    nombre: "María García",
    fecha_ingreso: "2023-03-19",
    salario: 4200000,
    activo: false,
  },
];

jest.mock("../hooks/useEmpleados", () => ({
  useEmpleados: () => ({
    empleados: mockEmpleados,
    pagination: {
      currentPage: 1,
      totalPages: 5,
      hasPrev: false,
      hasNext: true,
    },
    loading: false,
    error: null,
    fetchEmpleados: jest.fn(),
    createEmpleado: jest.fn(),
    updateEmpleado: jest.fn(),
    deleteEmpleado: jest.fn(),
  }),
}));

// Mock del formulario de empleados
jest.mock("../components/forms/EmpleadoForm", () => {
  return function MockEmpleadoForm({ onCancel }) {
    return (
      <div data-testid="empleado-form">
        <h3>Formulario Empleado</h3>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    );
  };
});

// Contextos de autenticación para testing
const mockAdminAuthContext = {
  user: { id: 1, username: "admin", rol: "administrador" },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  isAdmin: () => true,
};

const mockEmpleadoAuthContext = {
  user: { id: 2, username: "empleado", rol: "empleado" },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  isAdmin: () => false,
};

const renderWithAuth = (ui, authContext) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper });
};

describe("Gestión de Empleados - Tests Funcionales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Funcionalidades por Rol", () => {
    test("admin debe ver botón de crear empleado", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      await waitFor(() => {
        expect(screen.getByText("Nuevo Empleado")).toBeInTheDocument();
      });
    });

    test("empleado no debe ver botón de crear empleado", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.queryByText("Nuevo Empleado")).not.toBeInTheDocument();
      });
    });

    test("admin debe ver botones de acción", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      await waitFor(() => {
        expect(screen.getAllByText("Editar")).toHaveLength(2);
      });

      expect(screen.getAllByText("Eliminar")).toHaveLength(2);
    });

    test("empleado no debe ver botones de acción", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.queryByText("Editar")).not.toBeInTheDocument();
      });

      expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
    });

    test("admin debe ver columna de acciones", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      await waitFor(() => {
        expect(screen.getByText("Acciones")).toBeInTheDocument();
      });
    });

    test("empleado no debe ver columna de acciones", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.queryByText("Acciones")).not.toBeInTheDocument();
      });
    });
  });

  describe("Modal de Formulario", () => {
    test("admin puede abrir modal de creación", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      const btnNuevo = await screen.findByText("Nuevo Empleado");
      fireEvent.click(btnNuevo);

      await waitFor(() => {
        expect(screen.getByTestId("empleado-form")).toBeInTheDocument();
      });
    });

    test("admin puede cerrar modal", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      const btnNuevo = await screen.findByText("Nuevo Empleado");
      fireEvent.click(btnNuevo);

      await waitFor(() => {
        expect(screen.getByTestId("empleado-form")).toBeInTheDocument();
      });

      const btnCancelar = screen.getByText("Cancelar");
      fireEvent.click(btnCancelar);

      await waitFor(() => {
        expect(screen.queryByTestId("empleado-form")).not.toBeInTheDocument();
      });
    });

    test("admin puede abrir modal de edición", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      const botonesEditar = await screen.findAllByText("Editar");
      fireEvent.click(botonesEditar[0]);

      await waitFor(() => {
        expect(screen.getByTestId("empleado-form")).toBeInTheDocument();
      });
    });
  });

  describe("Interfaz General", () => {
    test("muestra título de la página", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.getByText("Gestión de Empleados")).toBeInTheDocument();
      });
    });

    test("muestra lista de empleados", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      });

      expect(screen.getByText("María García")).toBeInTheDocument();
    });

    test("muestra controles de filtros", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Nombre...")).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue("")).toBeInTheDocument(); // Estado selector
      expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // Por página selector

      // Verificar botón de búsqueda usando un selector más específico
      const botonesEncontrados = screen.getAllByText("Buscar");
      expect(botonesEncontrados.length).toBeGreaterThan(0);
    });

    test("muestra paginación", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.getByText("Anterior")).toBeInTheDocument();
      });

      expect(screen.getByText("Siguiente")).toBeInTheDocument();
      // Buscar el botón de página 1 específicamente
      const paginationButtons = screen.getAllByRole("button");
      const page1Button = paginationButtons.find(
        (btn) => btn.textContent === "1" && btn.className.includes("active")
      );
      expect(page1Button).toBeInTheDocument();
    });

    test("muestra estado de empleados correctamente", async () => {
      renderWithAuth(<Empleados />, mockEmpleadoAuthContext);

      await waitFor(() => {
        expect(screen.getByText("Activo")).toBeInTheDocument();
      });

      expect(screen.getByText("Inactivo")).toBeInTheDocument();
    });
  });

  describe("Búsqueda y Filtros", () => {
    test("permite buscar empleados", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      const inputBuscar = await screen.findByPlaceholderText("Nombre...");
      const botonesEncontrados = screen.getAllByText("Buscar");
      const btnBuscar = botonesEncontrados[0]; // Tomar el primer botón

      fireEvent.change(inputBuscar, { target: { value: "Juan" } });
      fireEvent.click(btnBuscar);

      expect(inputBuscar.value).toBe("Juan");
    });

    test("permite filtrar por estado", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      // Buscar el select de estado por su contenido inicial
      const selectEstado = await screen.findByDisplayValue("");

      fireEvent.change(selectEstado, { target: { value: "true" } });

      expect(selectEstado.value).toBe("true");
    });

    test("permite cambiar cantidad por página", async () => {
      renderWithAuth(<Empleados />, mockAdminAuthContext);

      // Buscar el select de paginación por su valor por defecto
      const selectPagina = await screen.findByDisplayValue("10");

      fireEvent.change(selectPagina, { target: { value: "25" } });

      expect(selectPagina.value).toBe("25");
    });
  });
});
