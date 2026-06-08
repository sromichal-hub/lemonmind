import axios from 'axios';
import { useAuthStore } from './store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, name: string) =>
    apiClient.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  me: () => apiClient.get('/auth/me'),
};

export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  create: (name: string, parentId?: number) =>
    apiClient.post('/categories', { name, parentId }),
  update: (id: number, name: string, parentId?: number) =>
    apiClient.put(`/categories/${id}`, { name, parentId }),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

export interface ProductData {
  name: string;
  categoryId?: number | null;
  gpsrIdentificationDetails?: string;
  gpsrWarningPhrases?: string;
  gpsrWarningText?: string;
  gpsrPictograms?: string;
  gpsrAdditionalSafetyInfo?: string;
  gpsrStatementOfCompliance?: string;
  gpsrOnlineInstructionsUrl?: string;
  gpsrInstructionsManual?: string;
  gpsrDeclarationsOfConformity?: string;
  gpsrCertificates?: string;
  gpsrModerationStatus?: string;
  gpsrModerationComment?: string;
  gpsrSubmittedBySupplierUser?: string;
}

export const productsAPI = {
  getAll: () => apiClient.get('/products'),
  getById: (id: number) => apiClient.get(`/products/${id}`),
  create: (data: ProductData) =>
    apiClient.post('/products', data),
  update: (id: number, data: ProductData) =>
    apiClient.put(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

