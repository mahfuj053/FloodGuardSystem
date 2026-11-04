import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import { fetchRequests, respondToRequest } from '../../api/endpoints'

export default function ResponderHome() {
  const [requests, setRequests] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    fetchRequests('pending')
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]))
  }

  useEffect(load, [])

  const handleRespond = async (id, status) => {
    setBusyId(id)
    try {
      await respondToRequest(id, status)
      load()
    } catch {
      // silently ignore for now; could add an error toast later
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <Navbar title="Responder" />
      <div className="container">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <a className="btn" href="/relief">Relief Management</a>
          <a className="btn" href="/funds/manage">Fund Management</a>
        </div>

        <h2>Pending Requests</h2>
        <div className="grid" style={{ gap: 12 }}>
          {requests.length === 0 && <Card>No pending requests right now.</Card>}
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
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn"
                  disabled={busyId === r.id}
                  onClick={() => handleRespond(r.id, 'in_progress')}
                >
                  Take
                </button>
                <button
                  className="btn btn-outline"
                  disabled={busyId === r.id}
                  onClick={() => handleRespond(r.id, 'fulfilled')}
                >
                  Mark fulfilled
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}