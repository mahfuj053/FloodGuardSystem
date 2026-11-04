import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import { fetchRequests, createHelpRequest } from '../../api/endpoints'

const TYPE_OPTIONS = [
  { value: 'rescue', label: 'Rescue' },
  { value: 'food', label: 'Food' },
  { value: 'medical', label: 'Medical' },
  { value: 'shelter', label: 'Shelter' },
  { value: 'other', label: 'Other' },
]

const PRIORITY_OPTIONS = [
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default function HelpRequest() {
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ type: 'rescue', description: '', location: '', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    fetchRequests()
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]))
  }

  useEffect(load, [])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createHelpRequest(form)
      setForm({ type: 'rescue', description: '', location: '', priority: 'medium' })
      load()
    } catch (err) {
      const data = err.response?.data
      setError(
        data && typeof data === 'object'
          ? Object.values(data).flat().join(' | ')
          : 'Could not submit request.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar title="Request Help" />
      <div className="container" style={{ maxWidth: 700 }}>
        <Card>
          <h3 style={{ marginTop: 0 }}>New request</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={update('type')}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Priority</label>
                <select className="input" value={form.priority} onChange={update('priority')}>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={update('location')} placeholder="Area / address" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={update('description')}
                placeholder="What do you need?"
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </Card>

        <h3 style={{ marginTop: 28 }}>Your requests</h3>
        <div className="grid" style={{ gap: 12 }}>
          {requests.length === 0 && <Card>No requests yet.</Card>}
          {requests.map((r) => (
            <Card key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{r.type} · {r.location}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>{r.description}</div>
                </div>
                <Badge status={r.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}