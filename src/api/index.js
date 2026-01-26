import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.humblegroupusa.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Token = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await api.post('/signup', userData);
    return response.data;
  },
  
  getUserData: async () => {
    const response = await api.get('/getUserData');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.post('/profile/update', profileData);
    return response.data;
  },
};

export const catalogApi = {
  getBrandsWithCategories: async (page = 1, perPage = 10) => {
    const response = await api.get('/brands/category/subcategory', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  getProductsBySubCategory: async (subCategoryId, page = 1, perPage = 100, search = '') => {
    const response = await api.get('/products/by-sub-category', {
      params: { 
        sub_category_id: subCategoryId,
        page, 
        per_page: perPage,
        ...(search && { search }),
      },
    });
    return response.data;
  },
};

export const locationApi = {
  getCountries: async () => {
    const response = await api.get('/countries');
    return response.data;
  },

  getStatesByCountry: async (iso2, search = '') => {
    const response = await api.get('/countries/states', {
      params: { 
        iso2,
        ...(search && { search }),
      },
    });
    return response.data;
  },
};

export const orderApi = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders/create', orderData);
    return response.data;
  },
};

export default api;