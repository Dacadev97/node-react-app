import React, { useState, Suspense, lazy } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useEmpleados } from "../hooks/useEmpleados";
import Navbar from "../components/common/Navbar";
import Loading from "../components/common/Loading";
import ErrorBoundary from "../components/common/ErrorBoundary";

const EmpleadoForm = lazy(() => import("../components/forms/EmpleadoForm"));

const EmpleadosContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const Button = styled.button`
  background: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const SearchContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px;
  border: 2px solid #e1e1e1;
  border-radius: 5px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 2px solid #e1e1e1;
  border-radius: 5px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }

  &:hover {
    background-color: #e9ecef;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
`;

const ActionButton = styled.button`
  background: ${(props) =>
    props.variant === "danger" ? "#dc3545" : "#007bff"};
  color: white;
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#c82333" : "#0056b3"};
  }
`;

const StatusBadge = styled.span`
  background: ${(props) => (props.active ? "#28a745" : "#6c757d")};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  border-radius: 4px;

  &:hover:not(:disabled) {
    background: #f8f9fa;
  }

  &:disabled {
    background: #e9ecef;
    cursor: not-allowed;
  }

  &.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;

  &:hover {
    color: #495057;
  }
`;

const Empleados = () => {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    activo: "",
    page: 1,
    limit: 10,
  });

  const {
    empleados,
    pagination,
    loading,
    error,
    fetchEmpleados,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
  } = useEmpleados(filters);

  const handleSearch = () => {
    fetchEmpleados({ ...filters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchEmpleados(newFilters);
  };

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este empleado?")
    ) {
      await deleteEmpleado(id);
    }
  };

  const handleFormSubmit = async (data) => {
    let result;
    if (editingEmpleado) {
      result = await updateEmpleado(editingEmpleado.id, data);
    } else {
      result = await createEmpleado(data);
    }

    if (result.success) {
      setShowForm(false);
      setEditingEmpleado(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmpleado(null);
  };

  return (
    <EmpleadosContainer>
      <Navbar />
      <Content>
        <Header>
          <Title>Gestión de Empleados</Title>
          {isAdmin() && (
            <Button onClick={() => setShowForm(true)}>Nuevo Empleado</Button>
          )}
        </Header>

        <SearchContainer>
          <SearchRow>
            <InputGroup>
              <Label>Buscar</Label>
              <Input
                type="text"
                placeholder="Nombre..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup>
              <Label>Estado</Label>
              <Select
                value={filters.activo}
                onChange={(e) =>
                  setFilters({ ...filters, activo: e.target.value })
                }
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Por página</Label>
              <Select
                value={filters.limit}
                onChange={(e) =>
                  setFilters({ ...filters, limit: parseInt(e.target.value) })
                }
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Select>
            </InputGroup>
            <Button onClick={handleSearch}>Buscar</Button>
          </SearchRow>
        </SearchContainer>

        <ErrorBoundary error={error} onRetry={() => fetchEmpleados(filters)} />

        {loading && <Loading text="Cargando empleados..." />}

        {!loading && (
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Nombre</TableHeaderCell>
                  <TableHeaderCell>Fecha Ingreso</TableHeaderCell>
                  <TableHeaderCell>Salario</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  {isAdmin() && <TableHeaderCell>Acciones</TableHeaderCell>}
                </tr>
              </TableHeader>
              <tbody>
                {empleados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell>{empleado.id}</TableCell>
                    <TableCell>{empleado.nombre}</TableCell>
                    <TableCell>
                      {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {empleado.salario
                        ? new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                          }).format(empleado.salario)
                        : "No especificado"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={empleado.activo}>
                        {empleado.activo ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </TableCell>
                    {isAdmin() && (
                      <TableCell>
                        <ActionButton onClick={() => handleEdit(empleado)}>
                          Editar
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          onClick={() => handleDelete(empleado.id)}
                        >
                          Eliminar
                        </ActionButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </Table>

            {pagination && (
              <Pagination>
                <PaginationButton
                  disabled={!pagination.hasPrev}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Anterior
                </PaginationButton>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <PaginationButton
                    key={page}
                    className={page === pagination.currentPage ? "active" : ""}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationButton>
                ))}

                <PaginationButton
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Siguiente
                </PaginationButton>
              </Pagination>
            )}
          </TableContainer>
        )}

        {showForm && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>
                  {editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
                </h3>
                <CloseButton onClick={handleCloseForm}>í—</CloseButton>
              </ModalHeader>
              <Suspense fallback={<Loading text="Cargando formulario..." />}>
                <EmpleadoForm
                  empleado={editingEmpleado}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCloseForm}
                />
              </Suspense>
            </ModalContent>
          </Modal>
        )}
      </Content>
    </EmpleadosContainer>
  );
};

export default Empleados;
