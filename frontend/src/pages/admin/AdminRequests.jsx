import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import { fetchRequests, respondToRequest } from '../../api/endpoints'

const STATUS_OPTIONS = [
  { value: '', label: 'Active (Pending + In Progress)' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = (s) => {
    setLoading(true)
    fetchRequests(s || undefined)
      .then(({ data }) => {
        const result = s ? data : data.filter((r) => r.status === 'pending' || r.status === 'in_progress')
        setRequests(result)
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(status), [status])

  const handleRespond = async (id, newStatus) => {
    setBusyId(id)
    try {
      await respondToRequest(id, newStatus)
      load(status)
    } catch {
      // ignore for now
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <Navbar title="All Requests" />
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Help Requests</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="btn-outline"
            style={{ marginLeft: 'auto', cursor: 'pointer' }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {loading && <Card>Loading...</Card>}

        <div className="grid" style={{ gap: 12 }}>
          {!loading && requests.length === 0 && <Card>No requests found for this filter.</Card>}
          {requests.map((r) => (
            <Card key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {r.type} · {r.location || 'No location given'}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{r.description}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    Requested by {r.user_name} · Priority: {r.priority}
                  </div>
                </div>
                <Badge status={r.status} />
              </div>

              {(r.status === 'pending' || r.status === 'in_progress') && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {r.status === 'pending' && (
                    <button
                      className="btn"
                      disabled={busyId === r.id}
                      onClick={() => handleRespond(r.id, 'in_progress')}
                    >
                      Take
                    </button>
                  )}
                  <button
                    className="btn btn-outline"
                    disabled={busyId === r.id}
                    onClick={() => handleRespond(r.id, 'fulfilled')}
                  >
                    Mark fulfilled
                  </button>
                  <button
                    className="btn btn-outline"
                    disabled={busyId === r.id}
                    onClick={() => handleRespond(r.id, 'cancelled')}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}