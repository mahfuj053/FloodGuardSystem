import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { initiatePayment } from '../../api/endpoints'

export default function Donate() {
  const [amount, setAmount] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await initiatePayment(Number(amount), details)
      // Full page redirect to SSLCommerz's sandbox payment page
      window.location.href = data.gateway_url
    } catch (err) {
      const d = err.response?.data
      setError(
        d && typeof d === 'object'
          ? Object.values(d).flat().join(' | ')
          : 'Could not start payment. Please try again.'
      )
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar title="Donate" />
      <div className="container" style={{ maxWidth: 480 }}>
        <Card>
          <h3 style={{ marginTop: 0 }}>Make a donation</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -8 }}>
            Payment is processed securely through SSLCommerz (sandbox).
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Amount (BDT)</label>
              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Note (optional)</label>
              <input
                className="input"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. For flood relief fund"
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Redirecting to payment...' : 'Proceed to pay'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}