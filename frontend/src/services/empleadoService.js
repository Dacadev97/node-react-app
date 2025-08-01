import api from "./api";

export const empleadoService = {
  getAll: async (params = {}) => {
    const response = await api.get("/empleados", { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/empleados/stats");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/empleados/${id}`);
    return response.data;
  },

  create: async (empleadoData) => {
    const response = await api.post("/empleados", empleadoData);
    return response.data;
  },

  update: async (id, empleadoData) => {
    const response = await api.put(`/empleados/${id}`, empleadoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/empleados/${id}`);
    return response.data;
  },
};
