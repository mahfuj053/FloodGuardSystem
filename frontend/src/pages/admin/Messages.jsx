import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { fetchMessages, sendMessage } from '../../api/endpoints'

export default function Messages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const load = () => fetchMessages().then(({ data }) => setMessages(data)).catch(() => setMessages([]))

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    setSending(true)
    try {
      await sendMessage({ content })
      setContent('')
      load()
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' | ') || 'Could not send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <Navbar title="Team Chat" />
      <div className="container">
        <Card style={{ maxHeight: 450, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 && <div style={{ color: 'var(--muted)' }}>No messages yet. Start the conversation.</div>}
          {messages.map((m) => {
            const mine = m.sender === user?.id
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  background: mine ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                  color: mine ? '#fff' : 'inherit',
                  padding: '8px 12px',
                  borderRadius: 10,
                  maxWidth: '75%',
                }}
              >
                {!mine && <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{m.sender_name}</div>}
                <div>{m.content}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </Card>

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message to the team..."
          />
          <button className="btn" type="submit" disabled={sending}>Send</button>
        </form>
        {error && <div className="error-text">{error}</div>}
      </div>
    </div>
  )
}