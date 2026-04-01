import axios from 'axios';

const API_BASE = 'https://inventoryhub-ykmn.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Unwrap { success, data } envelope from backend
    if (res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string }) => api.post('/auth/register', data),
};

// Products
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  getStats: () => api.get('/products/stats'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  updateStock: (id: string, data: { quantity: number; type: string; notes?: string }) => api.patch(`/products/${id}/stock`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: { name: string }) => api.post('/categories', data),
  update: (id: string, data: { name: string }) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Orders
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getStats: () => api.get('/orders/dashboard/stats'),
  getActivity: () => api.get('/orders/dashboard/activity'),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// Restock
export const restockApi = {
  getQueue: () => api.get('/restock/queue'),
  getStats: () => api.get('/restock/stats'),
  restock: (productId: string, data: { quantity: number; notes?: string }) => api.post(`/restock/${productId}/restock`, data),
  removeFromQueue: (productId: string) => api.delete(`/restock/${productId}/queue`),
};

export default api;
