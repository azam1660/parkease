import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId'); // Retrieve tenant ID

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers["x-tenant-id"] = tenantId; // Attach tenant ID
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Vehicle API
export const vehicleAPI = {
  registerEntry: (data) => api.post('/vehicles/entry', data),
  registerExit: (data) => api.post('/vehicles/exit', data),
  getAllVehicles: () => api.get('/vehicles'),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  findVehicleByPlate: (plateNumber) => api.get(`/vehicles/plate/${plateNumber}`),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
};

// Parking API
export const parkingAPI = {
  // Sections
  getAllSections: () => api.get('/parking/sections'),
  getSectionById: (id) => api.get(`/parking/sections/${id}`),
  createSection: (data) => api.post('/parking/sections', data),
  updateSection: (id, data) => api.put(`/parking/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/parking/sections/${id}`),

  // Slots
  getAllSlots: () => api.get('/parking/slots'),
  getSlotById: (id) => api.get(`/parking/slots/${id}`),
  createSlot: (data) => api.post('/parking/slots', data),
  updateSlot: (id, data) => api.put(`/parking/slots/${id}`, data),
  deleteSlot: (id) => api.delete(`/parking/slots/${id}`),
};

// Payment API
export const paymentAPI = {
  createPayment: (data) => api.post('/payments', data),
  getAllPayments: () => api.get('/payments'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  updatePaymentStatus: (id, status) => api.put(`/payments/${id}/status`, { status }),
  generateReceipt: (id) => api.get(`/payments/${id}/receipt`),
};

// Report API
export const reportAPI = {
  generateOccupancyReport: (data) => api.post('/reports/occupancy', data),
  generateRevenueReport: (data) => api.post('/reports/revenue', data),
  getAllReports: () => api.get('/reports'),
  getReportById: (id) => api.get(`/reports/${id}`),
  createScheduledReport: (data) => api.post('/reports/scheduled', data),
  updateScheduledReport: (id, data) => api.put(`/reports/scheduled/${id}`, data),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

// Settings API
export const settingsAPI = {
  getAllSettings: () => api.get('/settings'),
  getSettingsByCategory: (category) => api.get(`/settings/category/${category}`),
  getSettingByKey: (category, key) => api.get(`/settings/${category}/${key}`),
  upsertSetting: (data) => api.post('/settings', data),
  deleteSetting: (category, key) => api.delete(`/settings/${category}/${key}`),
  initializeDefaultSettings: () => api.post('/settings/initialize'),
};

// Error handler helper
export const handleApiError = (error) => {
  if (error.response) {
    console.log(error);
    // Server responded with error
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors || [],
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: 503,
      message: 'Service unavailable',
      errors: ['Unable to connect to the server'],
    };
  } else {
    // Request setup error
    return {
      status: 500,
      message: 'Request failed',
      errors: [error.message],
    };
  }
};

export default api;
