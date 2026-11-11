import axios from 'axios'

// Local dev (npm run dev): relative URL -> Vite proxy -> http://127.0.0.1:8000
// Production build (Vercel): deployed backend on Render
const API_BASE = import.meta.env.DEV
  ? ''
  : 'https://floodguard-backend-rjb4.onrender.com'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fg_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const clearSessionAndGoToLogin = () => {
  localStorage.removeItem('fg_access')
  localStorage.removeItem('fg_refresh')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Auto-refresh on 401 once, then bounce to login if refresh fails
let isRefreshing = false
let queue = []

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Login/refresh requests themselves must never trigger a refresh
    const url = original.url || ''
    if (url.includes('/auth/token/refresh/') || url.includes('/auth/login/')) {
      return Promise.reject(error)
    }

    const refresh = localStorage.getItem('fg_refresh')
    if (!refresh) {
      localStorage.removeItem('fg_access')
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true
    try {
      // Plain axios (not `api`) so this call bypasses the interceptors
      const { data } = await axios.post(`${API_BASE}/api/auth/token/refresh/`, { refresh })
      localStorage.setItem('fg_access', data.access)
      processQueue(null, data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearSessionAndGoToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)