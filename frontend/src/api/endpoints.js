import { api } from './client'

// --- Auth (config/urls.py: path('api/auth/', include('accounts.urls'))) ---
// Backend USERNAME_FIELD is 'email', so login takes email + password
export const login = (email, password) =>
  api.post('/api/auth/login/', { email, password })

export const register = (payload) => api.post('/api/auth/register/', payload)

export const fetchProfile = () => api.get('/api/auth/me/')
export const updateProfile = (payload) => api.patch('/api/auth/me/', payload)

// Rescue team's own availability toggle
export const fetchAvailability = () => api.get('/api/auth/availability/')
export const setAvailability = (isAvailable) =>
  api.patch('/api/auth/availability/', { is_available: isAvailable })

// Admin: list rescue_team users with availability
export const fetchVolunteers = () => api.get('/api/auth/volunteers/')
export const fetchGeneralUsers = () => api.get('/api/auth/general-users/')

// --- Help requests (config/urls.py: path('api/', include('requests_help.urls'))) ---
// GET is auto-filtered by backend: general_user sees only their own, responders/admin see all
export const fetchRequests = (status) =>
  api.get('/requests/', { params: status ? { status } : {} })

export const fetchRequestDetail = (id) => api.get(`/requests/${id}/`)

// general_user only — creates a request of type: rescue | food | medical | shelter | other
export const createHelpRequest = (payload) => api.post('/requests/', payload)

// rescue_team / ngo / admin only — status: in_progress | fulfilled | cancelled
export const respondToRequest = (id, status) =>
  api.patch(`/requests/${id}/respond/`, { status })

// --- Alerts (backend/alerts/urls.py) ---
export const fetchAlerts = () => api.get('/alerts/')
export const sendAlert = (payload) => api.post('/alerts/', payload)
export const fetchAlertDetail = (id) => api.get(`/alerts/${id}/`)

export const fetchNotifications = () => api.get('/notifications/')
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read/`)
export const markAllNotificationsRead = () => api.patch('/notifications/read-all/')

// --- Relief (backend/relief/urls.py) ---
export const fetchSupplies = () => api.get('/supplies/')
export const createSupply = (payload) => api.post('/supplies/', payload)

export const fetchDistributions = () => api.get('/aid/')
export const createDistribution = (payload) => api.post('/aid/', payload)
export const updateDistributionStatus = (id, status) =>
  api.patch(`/aid/${id}/status/`, { status })

// --- Funds (backend/funds/urls.py) ---
export const fetchDonations = () => api.get('/donations/')
export const createDonation = (payload) => api.post('/donations/', payload)
export const initiatePayment = (amount, details) =>
  api.post('/donations/initiate/', { amount, details })

export const fetchFundsBalance = () => api.get('/funds/balance/')

export const fetchFundRequests = () => api.get('/funds/distribute/')
export const createFundRequest = (payload) => api.post('/funds/distribute/', payload)
export const decideFundRequest = (id, status) =>
  api.patch(`/funds/distribute/${id}/`, { status })
export const completeFundRequest = (id) => api.patch(`/funds/distribute/${id}/complete/`)

// --- Dashboard (backend/dashboard/urls.py) ---
export const fetchDashboardStats = () => api.get('/stats/dashboard/')
export const fetchAnalytics = () => api.get('/stats/analytics/')

// --- Community (backend/community/urls.py) ---
export const fetchMessages = () => api.get('/messages/')
export const sendMessage = (payload) => api.post('/messages/', payload)

export const fetchFeedback = () => api.get('/feedback/')
export const submitFeedback = (payload) => api.post('/feedback/', payload)

export const fetchAreas = () => api.get('/areas/')
export const createArea = (payload) => api.post('/areas/', payload)
export const updateArea = (id, payload) => api.patch(`/areas/${id}/`, payload)