import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)'
    }}>
      <div style={{ fontWeight: 700 }}>FloodGuard {title ? `· ${title}` : ''}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.name || user?.email}</span>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}