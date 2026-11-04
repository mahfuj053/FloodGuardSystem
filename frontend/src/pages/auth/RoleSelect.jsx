import React from 'react'
import { useNavigate } from 'react-router-dom'

const roles = [
  { key: 'general_user', title: 'Affected Citizen', desc: 'Request help, food, or relief support.' },
  { key: 'rescue_team', title: 'Rescue Team', desc: 'Respond to requests, coordinate rescue efforts.' },
  { key: 'ngo', title: 'NGO', desc: 'Coordinate aid distribution and donations.' },
  { key: 'admin', title: 'Admin', desc: 'Manage users, alerts, and analytics. (Sign in only)' },
]

export default function RoleSelect() {
  const navigate = useNavigate()

  const choose = (roleKey) => {
    // Admin accounts are created via Django createsuperuser, not self-registration,
    // so this always sends the user to Login (with the role pre-filled for the others).
    navigate(`/login?role=${roleKey}`)
  }

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 60 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>FloodGuard</h1>
      <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 32 }}>
        Select how you'd like to continue
      </p>
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
        {roles.map((r) => (
          <button
            key={r.key}
            className="card"
            style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }}
            onClick={() => choose(r.key)}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>{r.title}</div>
            <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{r.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}