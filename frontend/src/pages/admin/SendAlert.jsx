import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { sendAlert } from '../../api/endpoints'

export default function SendAlert() {
  const [form, setForm] = useState({ title: '', message: '', area: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)
    try {
      await sendAlert(form)
      setSuccess(true)
      setForm({ title: '', message: '', area: '' })
    } catch (err) {
      const data = err.response?.data
      setError(
        data && typeof data === 'object'
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
          : 'Could not send alert. Check that /api/alerts/ accepts POST with these fields.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar title="Send Alert" />
      <div className="container" style={{ maxWidth: 600 }}>
        <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => navigate('/admin')}>
          ← Back to dashboard
        </button>
        <Card>
          <h3 style={{ marginTop: 0 }}>New flood alert</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={update('title')} required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Area</label>
              <input
                className="input"
                value={form.area}
                onChange={update('area')}
                placeholder="e.g. Baghibari, Narayantek"
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Message</label>
              <textarea className="input" rows={4} value={form.message} onChange={update('message')} required />
            </div>
            {error && <div className="error-text">{error}</div>}
            {success && (
              <div style={{ color: 'var(--success)', fontSize: 13, marginTop: 8 }}>
                Alert sent successfully.
              </div>
            )}
            <button className="btn" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
              {submitting ? 'Sending...' : 'Send alert'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}