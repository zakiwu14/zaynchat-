'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwpobugrmnuddvyyvwj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_H3dM5N81zTwpB7OmsYUAw_S-MCIy7w'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function ZaynChat() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchMessages()
    const channel = supabase.channel('messages-channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      setMessages(prev => [...prev, payload.new])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data)
  }

  const handleAuth = async () => {
    if (!email || !password) return alert('Enter email & password')
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        if (!username) return alert('Enter username')
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) await supabase.from('profiles').insert({ id: data.user.id, username })
      }
    } catch (e: any) { alert(e.message) } finally { setLoading(false) }
  }

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return
    const name = user.email?.split('@')[0] || username || 'User'
    await supabase.from('messages').insert({ user_id: user.id, username: name, content: newMsg })
    setNewMsg('')
  }

  const signOut = async () => { await supabase.auth.signOut(); setUser(null) }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4">
        <div className="bg-[#202c33] p-8 rounded-lg w-full max-w-sm">
          <h1 className="text-white text-3xl font-bold text-center mb-2">ZaynChat</h1>
          <p className="text-[#8696a0] text-center mb-6 text-sm">Real-time messenger</p>
          {!isLogin && <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-[#2a3942] text-white p-3 rounded mb-3 outline-none" />}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-[#2a3942] text-white p-3 rounded mb-3 outline-none" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-[#2a3942] text-white p-3 rounded mb-4 outline-none" />
          <button onClick={handleAuth} disabled={loading} className="w-full bg-[#00a884] text-white p-3 rounded font-bold">{loading ? '...' : isLogin ? 'Login' : 'Sign Up'}</button>
          <p className="text-[#8696a0] text-center mt-4 text-sm cursor-pointer" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "No account? Sign Up" : "Have account? Login"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#111b21] flex flex-col">
      <div className="bg-[#202c33] p-4 flex justify-between items-center">
        <h1 className="text-white font-bold text-xl">ZaynChat 💬</h1>
        <div className="flex items-center gap-3">
          <span className="text-[#8696a0] text-sm">{user.email}</span>
          <button onClick={signOut} className="text-[#8696a0] text-sm">Logout</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a]" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
        {messages.map((m) => {
          const isMe = m.user_id === user.id
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg p-3 ${isMe ? 'bg-[#005c4b] text-white' : 'bg-[#202c33] text-white'}`}>
                {!isMe && <p className="text-[#53bdeb] text-xs font-bold">{m.username}</p>}
                <p className="text-sm">{m.content}</p>
                <p className="text-[10px] opacity-60 text-right mt-1">{new Date(m.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="bg-[#202c33] p-3 flex gap-2">
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message" className="flex-1 bg-[#2a3942] text-white p-3 rounded-full outline-none" />
        <button onClick={sendMessage} className="bg-[#00a884] text-white w-12 h-12 rounded-full font-bold">➤</button>
      </div>
    </div>
  )
}
