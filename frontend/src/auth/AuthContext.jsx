import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as loginRequest, fetchProfile } from '../api/endpoints'

const AuthContext = createContext(null)

// Roles as defined in backend accounts/models.py (User.Role)
export const ROLES = {
  ADMIN: 'admin',
  RESCUE_TEAM: 'rescue_team',
  NGO: 'ngo',
  GENERAL: 'general_user',
}

// Roles allowed to land on the "responder" dashboard
export const RESPONDER_ROLES = [ROLES.RESCUE_TEAM, ROLES.NGO]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('fg_access')
    if (!token) {
      setLoading(false)
      return
    }
    fetchProfile()
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('fg_access')
        localStorage.removeItem('fg_refresh')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await loginRequest(email, password)
    // Backend LoginSerializer returns: { access, refresh, user: { id, email, name, role } }
    localStorage.setItem('fg_access', data.access)
    localStorage.setItem('fg_refresh', data.refresh)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('fg_access')
    localStorage.removeItem('fg_refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}