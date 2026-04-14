import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Auto ─────────────────────────────────────────────────────────────────────
export const autoAPI = {
  getAll: ()        => api.get("/auto").then(r => r.data),
  getOne: (id)      => api.get(`/auto/${id}`).then(r => r.data),
  create: (data)    => api.post("/auto", data).then(r => r.data),
  update: (id, data)=> api.put(`/auto/${id}`, data).then(r => r.data),
  remove: (id)      => api.delete(`/auto/${id}`).then(r => r.data),
};

// ─── Remont ───────────────────────────────────────────────────────────────────
export const remontAPI = {
  getAll:    (active = false) => api.get(`/remont${active ? "?active=true" : ""}`).then(r => r.data),
  getOne:    (id)             => api.get(`/remont/${id}`).then(r => r.data),
  create:    (data)           => api.post("/remont", data).then(r => r.data),
  update:    (id, data)       => api.put(`/remont/${id}`, data).then(r => r.data),
};

// ─── Довідники ────────────────────────────────────────────────────────────────
export const refAPI = {
  getSTO:       () => api.get("/sto").then(r => r.data),
  getMachenist: () => api.get("/machenist").then(r => r.data),
  getColors:    () => api.get("/colors").then(r => r.data),
  getUsers:     () => api.get("/users").then(r => r.data),
  getZap:       () => api.get("/zap").then(r => r.data),
};

export default api;
