import { api } from './client'

// --- Auth ---
export const login = (email, password) =>
  api.post('/api/auth/login/', { email, password })

export const register = (payload) => api.post('/api/auth/register/', payload)

export const fetchProfile = () => api.get('/api/auth/me/')
export const updateProfile = (payload) => api.patch('/api/auth/me/', payload)

export const fetchAvailability = () => api.get('/api/auth/availability/')
export const setAvailability = (isAvailable) =>
  api.patch('/api/auth/availability/', { is_available: isAvailable })

export const fetchVolunteers = () => api.get('/api/auth/volunteers/')
export const fetchGeneralUsers = () => api.get('/api/auth/general-users/')

// --- Help requests ---
export const fetchRequests = (status) =>
  api.get('/api/requests/', { params: status ? { status } : {} })
export const fetchRequestDetail = (id) => api.get(`/api/requests/${id}/`)
export const createHelpRequest = (payload) => api.post('/api/requests/', payload)
export const respondToRequest = (id, status) =>
  api.patch(`/api/requests/${id}/respond/`, { status })

// --- Alerts ---
export const fetchAlerts = () => api.get('/api/alerts/')
export const sendAlert = (payload) => api.post('/api/alerts/', payload)
export const fetchAlertDetail = (id) => api.get(`/api/alerts/${id}/`)
export const fetchNotifications = () => api.get('/api/notifications/')
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read/`)
export const markAllNotificationsRead = () => api.patch('/api/notifications/read-all/')

// --- Relief ---
export const fetchSupplies = () => api.get('/api/supplies/')
export const createSupply = (payload) => api.post('/api/supplies/', payload)
export const fetchDistributions = () => api.get('/api/aid/')
export const createDistribution = (payload) => api.post('/api/aid/', payload)
export const updateDistributionStatus = (id, status) =>
  api.patch(`/api/aid/${id}/status/`, { status })

// --- Funds ---
export const fetchDonations = () => api.get('/api/donations/')
export const createDonation = (payload) => api.post('/api/donations/', payload)
export const initiatePayment = (amount, details) =>
  api.post('/api/donations/initiate/', { amount, details })
export const fetchFundsBalance = () => api.get('/api/funds/balance/')
export const fetchFundRequests = () => api.get('/api/funds/distribute/')
export const createFundRequest = (payload) => api.post('/api/funds/distribute/', payload)
export const decideFundRequest = (id, status) =>
  api.patch(`/api/funds/distribute/${id}/`, { status })
export const completeFundRequest = (id) => api.patch(`/api/funds/distribute/${id}/complete/`)

// --- Dashboard ---
export const fetchDashboardStats = () => api.get('/api/stats/dashboard/')
export const fetchAnalytics = () => api.get('/api/stats/analytics/')

// --- Community ---
export const fetchMessages = () => api.get('/api/messages/')
export const sendMessage = (payload) => api.post('/api/messages/', payload)
export const fetchFeedback = () => api.get('/api/feedback/')
export const submitFeedback = (payload) => api.post('/api/feedback/', payload)
export const fetchAreas = () => api.get('/api/areas/')
export const createArea = (payload) => api.post('/api/areas/', payload)
export const updateArea = (id, payload) => api.patch(`/api/areas/${id}/`, payload)