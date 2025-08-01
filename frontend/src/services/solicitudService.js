import api from "./api";

export const solicitudService = {
  getAll: async (params = {}) => {
    const response = await api.get("/solicitudes", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  create: async (solicitudData) => {
    const response = await api.post("/solicitudes", solicitudData);
    return response.data;
  },

  update: async (id, solicitudData) => {
    const response = await api.put(`/solicitudes/${id}`, solicitudData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/solicitudes/${id}`);
    return response.data;
  },
};
