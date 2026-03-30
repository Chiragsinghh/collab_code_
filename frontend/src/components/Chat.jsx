import { useState, useRef, useEffect } from 'react'

function Chat({ socket, roomId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, { ...msg, id: Date.now() }])
    })

    return () => socket.off("receive-message")
  }, [socket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !socket) return

    const data = {
      roomId,
      user: 'You', 
      color: '#6c63ff',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    socket.emit("send-message", data)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ width: '260px', display: 'flex', flexDirection: 'column', backgroundColor: '#16213e', borderLeft: '1px solid #333', flexShrink: 0 }}>
      <div style={{ height: '36px', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid #333', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4caf50' }} />
        <span style={{ color: '#ccc', fontSize: '13px', fontWeight: '500' }}>Room Chat</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: msg.color }}>{msg.user}</span>
              <span style={{ fontSize: '10px', color: '#555' }}>{msg.time}</span>
            </div>
            <div style={{ backgroundColor: msg.user === 'You' ? '#2a2a4a' : '#1e1e3a', borderRadius: msg.user === 'You' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '8px 10px', maxWidth: '100%', border: `1px solid ${msg.user === 'You' ? '#3a3a6a' : '#2a2a4a'}` }}>
              <span style={{ color: '#e0e0e0', fontSize: '13px', lineHeight: '1.4' }}>{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid #333', backgroundColor: '#1a1a2e' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Message room..." rows={1} style={{ flex: 1, backgroundColor: '#2d2d4e', border: '1px solid #444', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: '1.4' }} />
          <button onClick={sendMessage} style={{ backgroundColor: '#6c63ff', border: 'none', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat