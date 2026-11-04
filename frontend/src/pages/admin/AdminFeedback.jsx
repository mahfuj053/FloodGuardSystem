import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { fetchFeedback } from '../../api/endpoints'

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedback()
      .then(({ data }) => setFeedbacks(data))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false))
  }, [])

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : null

  return (
    <div>
      <Navbar title="User Feedback" />
      <div className="container">
        {avgRating && (
          <Card style={{ marginBottom: 16 }}>
            Average rating: <strong style={{ color: 'var(--success)' }}>{avgRating} / 5</strong> ({feedbacks.length} responses)
          </Card>
        )}

        {loading && <Card>Loading...</Card>}

        <div className="grid" style={{ gap: 10 }}>
          {!loading && feedbacks.length === 0 && <Card>No feedback submitted yet.</Card>}
          {feedbacks.map((f) => (
            <Card key={f.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{'⭐'.repeat(f.rating)} ({f.rating}/5)</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{f.message}</div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{f.user_name}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}