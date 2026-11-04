import React, { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import {
  fetchSupplies, createSupply,
  fetchDistributions, createDistribution, updateDistributionStatus,
} from '../../api/endpoints'

const NEXT_STATUS = { planned: 'in_transit', in_transit: 'delivered' }
const NEXT_LABEL = { planned: 'Mark in transit', in_transit: 'Mark delivered' }

const FILTER_OPTIONS = [
  { value: 'active', label: 'Active (Planned + In Transit)' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'all', label: 'All' },
]

export default function ReliefManage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [supplies, setSupplies] = useState([])
  const [distributions, setDistributions] = useState([])
  const [distFilter, setDistFilter] = useState('active')
  const [supplyForm, setSupplyForm] = useState({ item_type: '', quantity: '' })
  const [distForm, setDistForm] = useState({ supply: '', distributed_to: '', quantity: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadSupplies = () => fetchSupplies().then(({ data }) => setSupplies(data)).catch(() => setSupplies([]))
  const loadDistributions = () => fetchDistributions().then(({ data }) => setDistributions(data)).catch(() => setDistributions([]))

  useEffect(() => { loadSupplies(); loadDistributions() }, [])

  const handleAddSupply = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createSupply({ item_type: supplyForm.item_type, quantity: Number(supplyForm.quantity) })
      setSupplyForm({ item_type: '', quantity: '' })
      loadSupplies()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not add supply.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateDistribution = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createDistribution({
        supply: Number(distForm.supply),
        distributed_to: distForm.distributed_to,
        quantity: Number(distForm.quantity),
      })
      setDistForm({ supply: '', distributed_to: '', quantity: '' })
      loadDistributions()
      loadSupplies()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not create distribution.')
    } finally {
      setSubmitting(false)
    }
  }

  const advanceStatus = async (dist) => {
    const next = NEXT_STATUS[dist.status]
    if (!next) return
    await updateDistributionStatus(dist.id, next)
    loadDistributions()
  }

  const visibleDistributions = distributions.filter((d) => {
    if (distFilter === 'all') return true
    if (distFilter === 'delivered') return d.status === 'delivered'
    return d.status !== 'delivered'
  })

  return (
    <div>
      <Navbar title="Relief Management" />
      <div className="container">
        <h3>Relief Supplies</h3>
        {isAdmin && (
          <Card style={{ marginBottom: 16 }}>
            <form onSubmit={handleAddSupply} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 160 }}>
                <label className="label">Item type</label>
                <input
                  className="input"
                  value={supplyForm.item_type}
                  onChange={(e) => setSupplyForm((f) => ({ ...f, item_type: e.target.value }))}
                  placeholder="e.g. Rice (25kg bags)"
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <label className="label">Quantity</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={supplyForm.quantity}
                  onChange={(e) => setSupplyForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                />
              </div>
              <button className="btn" type="submit" disabled={submitting}>Add stock</button>
            </form>
          </Card>
        )}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 28 }}>
          {supplies.length === 0 && <Card>No supplies recorded yet.</Card>}
          {supplies.map((s) => (
            <Card key={s.id}>
              <div style={{ fontWeight: 600 }}>{s.item_type}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>In stock: {s.quantity}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Aid Distribution</h3>
          <select
            value={distFilter}
            onChange={(e) => setDistFilter(e.target.value)}
            className="btn-outline"
            style={{ marginLeft: 'auto', cursor: 'pointer' }}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <form onSubmit={handleCreateDistribution} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="label">Supply</label>
              <select
                className="input"
                value={distForm.supply}
                onChange={(e) => setDistForm((f) => ({ ...f, supply: e.target.value }))}
                required
              >
                <option value="">Select item</option>
                {supplies.map((s) => (
                  <option key={s.id} value={s.id}>{s.item_type} ({s.quantity} available)</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="label">Distributed to</label>
              <input
                className="input"
                value={distForm.distributed_to}
                onChange={(e) => setDistForm((f) => ({ ...f, distributed_to: e.target.value }))}
                placeholder="Name or area"
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label className="label">Quantity</label>
              <input
                className="input"
                type="number"
                min="1"
                value={distForm.quantity}
                onChange={(e) => setDistForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>Dispatch</button>
          </form>
          {error && <div className="error-text">{error}</div>}
        </Card>

        <div className="grid" style={{ gap: 10 }}>
          {visibleDistributions.length === 0 && <Card>No distributions found for this filter.</Card>}
          {visibleDistributions.map((d) => (
            <Card key={d.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{d.quantity} x {d.supply_name} → {d.distributed_to}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>By {d.distributed_by_name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge status={d.status} />
                  {NEXT_STATUS[d.status] && (
                    <button className="btn btn-outline" onClick={() => advanceStatus(d)}>
                      {NEXT_LABEL[d.status]}
                    </button>
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