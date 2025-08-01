import { useState, useEffect, useCallback } from "react";
import { empleadoService } from "../services/empleadoService";

export const useEmpleados = (params = {}) => {
  const [empleados, setEmpleados] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmpleados = useCallback(
    async (searchParams = params) => {
      try {
        setLoading(true);
        setError(null);

        const response = await empleadoService.getAll(searchParams);

        if (response.success) {
          setEmpleados(response.data.empleados);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error al cargar empleados");
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const createEmpleado = async (empleadoData) => {
    try {
      setLoading(true);
      const response = await empleadoService.create(empleadoData);

      if (response.success) {
        await fetchEmpleados(); // Refrescar lista
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al crear empleado";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateEmpleado = async (id, empleadoData) => {
    try {
      setLoading(true);
      const response = await empleadoService.update(id, empleadoData);

      if (response.success) {
        await fetchEmpleados(); // Refrescar lista
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar empleado";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteEmpleado = async (id) => {
    try {
      setLoading(true);
      const response = await empleadoService.delete(id);

      if (response.success) {
        await fetchEmpleados(); // Refrescar lista
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar empleado";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  return {
    empleados,
    pagination,
    loading,
    error,
    fetchEmpleados,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
  };
};
