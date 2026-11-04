import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import StatCard from '../../components/StatCard'
import { fetchRequests, fetchVolunteers, fetchFundsBalance } from '../../api/endpoints'

export default function AdminDashboard() {
  const [requests, setRequests] = useState(null)
  const [volunteers, setVolunteers] = useState(null)
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    fetchRequests()
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]))
    fetchVolunteers()
      .then(({ data }) => setVolunteers(data))
      .catch(() => setVolunteers([]))
    fetchFundsBalance()
      .then(({ data }) => setBalance(data))
      .catch(() => setBalance(null))
  }, [])

  const pendingCount = requests?.filter((r) => r.status === 'pending').length
  const inProgressCount = requests?.filter((r) => r.status === 'in_progress').length
  const availableVolunteers = volunteers?.filter((v) => v.is_available).length

  const money = (v) => (v === undefined || v === null ? '...' : `৳${Number(v).toLocaleString()}`)

  return (
    <div>
      <Navbar title="Admin Dashboard" />
      <div className="container">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <StatCard label="Pending Requests" value={pendingCount ?? '...'} accent="#f59e0b" />
          <StatCard label="In Progress" value={inProgressCount ?? '...'} accent="var(--accent)" />
          <StatCard label="Total Requests" value={requests?.length ?? '...'} />
          <StatCard
            label="Volunteers Available"
            value={volunteers ? `${availableVolunteers} / ${volunteers.length}` : '...'}
            accent="var(--success)"
          />
        </div>

        <h3 style={{ marginTop: 28 }}>Donation Funds</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <StatCard label="Total Donated" value={money(balance?.total_donated)} accent="var(--success)" />
          <StatCard label="Total Allocated" value={money(balance?.total_allocated)} accent="#f59e0b" />
          <StatCard label="Available Balance" value={money(balance?.available)} accent="var(--accent)" />
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="btn" href="/admin/send-alert">Send Alert</a>
          <a className="btn" href="/admin/requests">View Requests</a>
          <a className="btn" href="/relief">Relief Management</a>
          <a className="btn" href="/funds/manage">Fund Management</a>
          <a className="btn" href="/admin/feedback">View Feedback</a>
        </div>

        <h3 style={{ marginTop: 28 }}>Volunteers</h3>
        <div className="grid" style={{ gap: 10 }}>
          {volunteers?.length === 0 && <div className="card">No rescue team members registered yet.</div>}
          {volunteers?.map((v) => (
            <div key={v.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{v.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{v.email} · {v.location || 'No location set'}</div>
              </div>
              <span style={{ color: v.is_available ? 'var(--success)' : 'var(--muted)', fontSize: 13}}>
                {v.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}