import React from 'react'

export default function StatCard({ label, value, accent }) {
  return (
    <div className="card">
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: accent || 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}
