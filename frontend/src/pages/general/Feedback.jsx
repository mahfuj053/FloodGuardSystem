import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { fetchFeedback, submitFeedback } from '../../api/endpoints'

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const load = () => fetchFeedback().then(({ data }) => setFeedbacks(data)).catch(() => setFeedbacks([]))

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)
    try {
      await submitFeedback({ message, rating: Number(rating) })
      setMessage('')
      setRating(5)
      setSuccess(true)
      load()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not submit feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar title="Feedback" />
      <div className="container">
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Share your feedback</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Rating</label>
              <select
                className="input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Your message</label>
              <textarea
                className="input"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your experience with FloodGuard"
                required
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>Submit Feedback</button>
          </form>
          {error && <div className="error-text">{error}</div>}
          {success && <div style={{ color: 'var(--success)', marginTop: 8 }}>Thank you for your feedback!</div>}
        </Card>

        <h3>Your Previous Feedback</h3>
        <div className="grid" style={{ gap: 10 }}>
          {feedbacks.length === 0 && <Card>You haven't submitted any feedback yet.</Card>}
          {feedbacks.map((f) => (
            <Card key={f.id}>
              <div style={{ fontWeight: 600 }}>{'⭐'.repeat(f.rating)} ({f.rating}/5)</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{f.message}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}