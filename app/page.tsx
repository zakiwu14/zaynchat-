"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user || null))
    return () => { sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from("messages").select("*").order("created_at").limit(100).then(({ data }) => { if (data) setMessages(data) })
    const ch = supabase.channel("chat").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p) => setMessages((m) => [...m, p.new])).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  async function handleAuth(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) await supabase.from("profiles").insert({ id: data.user.id, username: username || email.split("@")[0] })
        alert("Account created! Now login.")
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) { alert(err.message) } finally { setLoading(false) }
  }

  async function sendMessage(e: any) {
    e.preventDefault()
    if (!newMsg.trim()) return
    const { data: prof } = await supabase.from("profiles").select("username").eq("id", user.id).single()
    await supabase.from("messages").insert({ content: newMsg, user_id: user.id, username: prof?.username || email.split("@")[0] || "User" })
    setNewMsg("")
  }

  if (!user) {
    return (
      <main style={{ minHeight: "100vh", background: "#111b21", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 400, background: "#202c33", borderRadius: 16, padding: 32, border: "1px solid #2a3942" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, background: "#00a884", borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💬</div>
            <h1 style={{ color: "white", fontSize: 30, fontWeight: 800, margin: 0 }}>ZaynChat</h1>
            <p style={{ color: "#8696a0", marginTop: 6 }}>Real-time messenger</p>
          </div>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ padding: 14, borderRadius: 8, background: "#2a3942", border: "1px solid #2a3942", color: "white" }} />
            {isSignUp && <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required style={{ padding: 14, borderRadius: 8, background: "#2a3942", border: "1px solid #2a3942", color: "white" }} />}
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ padding: 14, borderRadius: 8, background: "#2a3942", border: "1px solid #2a3942", color: "white" }} />
            <button type="submit" disabled={loading} style={{ padding: 14, borderRadius: 8, background: "#00a884", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>{loading ? "..." : isSignUp ? "Sign Up" : "Login"}</button>
          </form>
          <p style={{ color: "#8696a0", textAlign: "center", marginTop: 16, fontSize: 14 }}>{isSignUp ? "Have account? " : "Need account? "}<span onClick={() => setIsSignUp(!isSignUp)} style={{ color: "#00a884", fontWeight: 700, cursor: "pointer" }}>{isSignUp ? "Login" : "Sign Up"}</span></p>
        </div>
      </main>
    )
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111b21" }}>
      <div style={{ background: "#202c33", padding: 14, display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2a3942" }}>
        <b style={{ color: "white" }}>ZaynChat</b>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#8696a0", cursor: "pointer" }}>Logout</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8, background: "#0b141a" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ alignSelf: m.user_id === user.id ? "flex-end" : "flex-start", background: m.user_id === user.id ? "#005c4b" : "#202c33", color: "white", padding: "8px 12px", borderRadius: 10, maxWidth: "75%" }}>
            <div style={{ fontSize: 11, color: "#00a884", fontWeight: 700 }}>{m.username}</div>
            <div style={{ fontSize: 14 }}>{m.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} style={{ background: "#202c33", padding: 10, display: "flex", gap: 8 }}>
        <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type message" style={{ flex: 1, padding: 12, borderRadius: 20, border: "none", background: "#2a3942", color: "white" }} />
        <button style={{ width: 44, height: 44, borderRadius: "50%", background: "#00a884", border: "none", color: "white" }}>➤</button>
      </form>
    </div>
  )
}
