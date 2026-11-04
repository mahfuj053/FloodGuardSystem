import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'

const MESSAGES = {
  success: { title: 'Donation successful', text: 'Thank you! Your donation has been received.', color: 'var(--success)' },
  failed: { title: 'Payment failed', text: 'The payment could not be completed. Please try again.', color: 'var(--danger)' },
  cancelled: { title: 'Payment cancelled', text: 'You cancelled the payment.', color: 'var(--muted)' },
}

export default function DonationResult() {
  const [params] = useSearchParams()
  const status = params.get('status') || 'failed'
  const tranId = params.get('tran_id')
  const info = MESSAGES[status] || MESSAGES.failed

  return (
    <div>
      <Navbar title="Donation" />
      <div className="container" style={{ maxWidth: 480, textAlign: 'center' }}>
        <Card>
          <h2 style={{ color: info.color, marginTop: 0 }}>{info.title}</h2>
          <p style={{ color: 'var(--muted)' }}>{info.text}</p>
          {tranId && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Transaction ID: {tranId}</p>
          )}
          <Link to="/home" className="btn" style={{ display: 'inline-block', marginTop: 16 }}>
            Back to home
          </Link>
        </Card>
      </div>
    </div>
  )
}