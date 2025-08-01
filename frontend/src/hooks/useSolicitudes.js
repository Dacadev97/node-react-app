import { useState, useEffect, useCallback } from "react";
import { solicitudService } from "../services/solicitudService";

export const useSolicitudes = (params = {}) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSolicitudes = useCallback(
    async (searchParams = params) => {
      try {
        setLoading(true);
        setError(null);

        const response = await solicitudService.getAll(searchParams);

        if (response.success) {
          setSolicitudes(response.data.solicitudes);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error al cargar solicitudes");
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const createSolicitud = async (solicitudData) => {
    try {
      setLoading(true);
      const response = await solicitudService.create(solicitudData);

      if (response.success) {
        await fetchSolicitudes();
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al crear solicitud";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateSolicitud = async (id, solicitudData) => {
    try {
      setLoading(true);
      const response = await solicitudService.update(id, solicitudData);

      if (response.success) {
        await fetchSolicitudes(); // Refrescar lista
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar solicitud";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteSolicitud = async (id) => {
    try {
      setLoading(true);
      const response = await solicitudService.delete(id);

      if (response.success) {
        await fetchSolicitudes(); // Refrescar lista
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar solicitud";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  return {
    solicitudes,
    pagination,
    loading,
    error,
    fetchSolicitudes,
    createSolicitud,
    updateSolicitud,
    deleteSolicitud,
  };
};
