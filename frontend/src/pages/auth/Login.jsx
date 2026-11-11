import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth, ROLES, RESPONDER_ROLES } from '../../auth/AuthContext'

const ROLE_LABELS = {
  general_user: 'Affected Citizen',
  rescue_team: 'Rescue Team',
  ngo: 'NGO',
  admin: 'Admin',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedRole = params.get('role')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)

      // Selected role card must match the account's real role
      if (preselectedRole && user.role !== preselectedRole) {
        localStorage.removeItem('fg_access')
        localStorage.removeItem('fg_refresh')
        if (typeof logout === 'function') logout()
        setError(
          `This account is registered as ${ROLE_LABELS[user.role] || user.role}, ` +
            `not ${ROLE_LABELS[preselectedRole] || preselectedRole}. ` +
            `Go back and choose the correct role.`
        )
        return
      }

      redirectByRole(user.role, navigate)
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Login failed. Check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        {preselectedRole && (
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -8 }}>
            Continuing as <strong>{ROLE_LABELS[preselectedRole] || preselectedRole}</strong>{' '}
            · <Link to="/select-role" style={{ color: 'var(--accent)' }}>change role</Link>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

// Role-based redirect after successful login
export function redirectByRole(role, navigate) {
  if (role === ROLES.ADMIN) navigate('/admin')
  else if (RESPONDER_ROLES.includes(role)) navigate('/responder')
  else navigate('/home')
}