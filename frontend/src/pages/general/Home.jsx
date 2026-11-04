import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { fetchAlerts } from '../../api/endpoints'

export default function GeneralHome() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchAlerts()
      .then(({ data }) => setAlerts(data.slice(0, 5)))
      .catch(() => setAlerts([]))
  }, [])

  return (
    <div>
      <Navbar title="Home" />
      <div className="container">
        <h2>Latest Flood Alerts</h2>
        <div className="grid" style={{ gap: 12 }}>
          {alerts.length === 0 && (
            <Card>No alerts right now.</Card>
          )}
          {alerts.map((a) => (
            <Card key={a.id}>
              <div style={{ fontWeight: 600 }}>{a.title || a.area}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{a.message}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <a className="btn" href="/help-request">Request Help / Food / Shelter</a>
          <a className="btn" href="/donate">Donate</a>
          <a className="btn" href="/feedback">Give Feedback</a>
        </div>
      </div>
    </div>
  )
}