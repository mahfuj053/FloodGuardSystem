import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { register } from '../../api/endpoints'

// Backend RegisterSerializer only allows these (admin can't self-register)
const ROLE_OPTIONS = [
  { value: 'general_user', label: 'Affected Citizen' },
  { value: 'rescue_team', label: 'Rescue Team' },
  { value: 'ngo', label: 'NGO' },
]

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'general_user',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useState(() => {
    const r = params.get('role')
    if (r && ROLE_OPTIONS.some((opt) => opt.value === r)) {
      setForm((f) => ({ ...f, role: r }))
    }
  }, [])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
        setError(msg)
      } else {
        setError('Registration failed. Please check the form.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 40 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Create account</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="label">First name</label>
              <input className="input" value={form.first_name} onChange={update('first_name')} required />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Last name</label>
              <input className="input" value={form.last_name} onChange={update('last_name')} required />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Phone (optional)</label>
            <input className="input" value={form.phone} onChange={update('phone')} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={update('password')} required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Confirm password</label>
            <input
              className="input"
              type="password"
              value={form.confirm_password}
              onChange={update('confirm_password')}
              required
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={update('role')}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}