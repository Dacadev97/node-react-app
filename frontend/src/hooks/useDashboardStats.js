import { useState, useEffect } from "react";
import { empleadoService } from "../services/empleadoService";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    empleadosActivos: 0,
    empleadosInactivos: 0,
    totalEmpleados: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsResponse = await empleadoService.getStats();

      if (statsResponse.success) {
        const { totalEmpleados, empleadosActivos, empleadosInactivos } =
          statsResponse.data;

        setStats({
          empleadosActivos,
          empleadosInactivos,
          totalEmpleados,
        });
      }
    } catch (err) {
      console.error("Error completo al cargar estadí­sticas:", err);
      console.error("Respuesta del error:", err.response);
      console.error("Datos del error:", err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error al cargar estadí­sticas";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
