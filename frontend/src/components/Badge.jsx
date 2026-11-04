import React from 'react'

const colors = {
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
  default: '#64748b',
}

export default function Badge({ status }) {
  const color = colors[status] || colors.default
  return (
    <span style={{
      background: `${color}22`, color, padding: '3px 10px',
      borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}
