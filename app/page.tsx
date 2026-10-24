"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ZaynChat() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(100)
      if (data) setMessages(data)
    }
    fetchMessages()
    const channel = supabase.channel("messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      setMessages((prev) => [...prev, payload.new])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) { await supabase.from("profiles").insert({ id: data.user.id, username: username || email.split("@")[0] }); alert("Account created!") }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) { alert(err.message) } finally { setLoading(false) }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()
    await supabase.from("messages").insert({ content: newMessage, user_id: user.id, username: profile?.username || user.email?.split("@")[0] })
    setNewMessage("")
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111b21", padding: "16px" }}>
        <div style={{ width: "100%", maxWidth: "400px", background: "#202c33", borderRadius: "12px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", margin: "0 0 8px 0" }}>ZaynChat</h1>
            <p style={{ color: "#8696a0", margin: 0 }}>Real-time messenger</p>
          </div>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #2a3942", background: "#2a3942", color: "white", fontSize: "16px" }} />
            {isSignUp && (
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
                style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #2a3942", background: "#2a3942", color: "white", fontSize: "16px" }} />
            )}
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #2a3942", background: "#2a3942", color: "white", fontSize: "16px" }} />
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#00a884", color: "white", fontWeight: "bold", fontSize: "16px" }}>
              {loading ? "..." : isSignUp ? "Sign Up" : "Login"}
            </button>
          </form>
          <p style={{ textAlign: "center", color: "#8696a0", marginTop: "20px", fontSize: "14px" }}>
            {isSignUp ? "Have account? " : "No account? "}
            <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: "#00a884", cursor: "pointer", fontWeight: "bold" }}>{isSignUp ? "Login" : "Sign Up"}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111b21" }}>
      <div style={{ background: "#202c33", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "white", fontWeight: "bold", margin: 0 }}>ZaynChat</h2>
        <button onClick={() => supabase.auth.signOut()} style={{ color: "#8696a0", background: "none", border: "none" }}>Logout</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", background: "#0b141a" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ alignSelf: m.user_id === user.id ? "flex-end" : "flex-start", background: m.user_id === user.id ? "#005c4b" : "#202c33", color: "white", padding: "8px 12px", borderRadius: "8px", maxWidth: "70%" }}>
            <div style={{ fontSize: "12px", color: "#00a884", fontWeight: "bold" }}>{m.username}</div>
            <div>{m.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ background: "#202c33", padding: "12px", display: "flex", gap: "8px" }}>
        <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message"
          style={{ flex: 1, padding: "12px", borderRadius: "24px", border: "none", background: "#2a3942", color: "white" }} />
        <button type="submit" style={{ background: "#00a884", border: "none", borderRadius: "50%", width: "48px", height: "48px", color: "white", fontSize: "20px" }}>➤</button>
      </form>
    </div>
  )
}
