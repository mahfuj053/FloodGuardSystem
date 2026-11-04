import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import {
  fetchFundRequests, createFundRequest, decideFundRequest, completeFundRequest,
  fetchGeneralUsers, fetchFundsBalance,
} from '../../api/endpoints'

const FILTER_OPTIONS = [
  { value: 'active', label: 'Active (Requested + Approved)' },
  { value: 'distributed', label: 'Distributed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

export default function FundManage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isRescue = user?.role === 'rescue_team'

  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('active')
  const [beneficiaries, setBeneficiaries] = useState([])
  const [balance, setBalance] = useState(null)
  const [form, setForm] = useState({ beneficiary: '', amount: '', note: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => fetchFundRequests().then(({ data }) => setRequests(data)).catch(() => setRequests([]))

  useEffect(() => {
    load()
    if (isRescue) {
      fetchGeneralUsers().then(({ data }) => setBeneficiaries(data)).catch(() => setBeneficiaries([]))
    }
    if (isAdmin) {
      fetchFundsBalance().then(({ data }) => setBalance(data)).catch(() => setBalance(null))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createFundRequest({
        beneficiary: Number(form.beneficiary),
        amount: Number(form.amount),
        note: form.note,
      })
      setForm({ beneficiary: '', amount: '', note: '' })
      load()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDecision = async (id, status) => {
    try {
      await decideFundRequest(id, status)
      load()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not update request.')
    }
  }

  const handleComplete = async (id) => {
    try {
      await completeFundRequest(id)
      load()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not mark distributed.')
    }
  }

  const visibleRequests = requests.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'distributed') return r.status === 'distributed'
    if (filter === 'rejected') return r.status === 'rejected'
    return r.status === 'requested' || r.status === 'approved'
  })

  return (
    <div>
      <Navbar title="Fund Management" />
      <div className="container">
        {isAdmin && balance && (
          <Card style={{ marginBottom: 16 }}>
            Available balance: <strong style={{ color: 'var(--success)' }}>৳{Number(balance.available).toLocaleString()}</strong>
          </Card>
        )}

        {isRescue && (
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Request fund for a victim</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="label">Beneficiary</label>
                <select
                  className="input"
                  value={form.beneficiary}
                  onChange={(e) => setForm((f) => ({ ...f, beneficiary: e.target.value }))}
                  required
                >
                  <option value="">Select person</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label className="label">Amount (BDT)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>
              <div style={{ flex: 2, minWidth: 180 }}>
                <label className="label">Note</label>
                <input
                  className="input"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Reason for this fund request"
                />
              </div>
              <button className="btn" type="submit" disabled={submitting}>Request</button>
            </form>
            {error && <div className="error-text">{error}</div>}
          </Card>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Fund Requests</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="btn-outline"
            style={{ marginLeft: 'auto', cursor: 'pointer' }}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="grid" style={{ gap: 10 }}>
          {visibleRequests.length === 0 && <Card>No fund requests found for this filter.</Card>}
          {visibleRequests.map((r) => (
            <Card key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>৳{Number(r.amount).toLocaleString()} to {r.beneficiary_name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>{r.note || 'No note'}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                    Requested by {r.requested_by_name}
                    {r.approved_by_name && ` · Decided by ${r.approved_by_name}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge status={r.status} />
                  {isAdmin && r.status === 'requested' && (
                    <>
                      <button className="btn" onClick={() => handleDecision(r.id, 'approved')}>Approve</button>
                      <button className="btn btn-outline" onClick={() => handleDecision(r.id, 'rejected')}>Reject</button>
                    </>
                  )}
                  {isRescue && r.status === 'approved' && (
                    <button className="btn" onClick={() => handleComplete(r.id)}>Mark distributed</button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}