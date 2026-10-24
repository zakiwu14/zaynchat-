"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(url, key)

export default function Page(){
  const [user,setUser]=useState<any>(null)
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [username,setUsername]=useState("")
  const [isSignUp,setIsSignUp]=useState(false)
  const [messages,setMessages]=useState<any[]>([])
  const [newMsg,setNewMsg]=useState("")
  const endRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null))
    const {data} = supabase.auth.onAuthStateChange((_,s)=>setUser(s?.user||null))
    return ()=>{data.subscription.unsubscribe()}
  },[])

  useEffect(()=>{
    if(!user) return
    supabase.from("messages").select("*").order("created_at").then(({data})=>{if(data) setMessages(data)})
    const ch=supabase.channel("m").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>setMessages(m=>[...m,p.new])).subscribe()
    return ()=>{supabase.removeChannel(ch)}
  },[user])

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages])

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#111b21",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{width:"100%",maxWidth:400,background:"#202c33",borderRadius:16,padding:32}}>
          <h1 style={{color:"white",textAlign:"center",fontSize:32,marginBottom:20}}>ZaynChat</h1>
          <form onSubmit={async(e)=>{e.preventDefault()
            if(isSignUp){
              const {data,error}=await supabase.auth.signUp({email,password})
              if(error) alert(error.message)
              else{await supabase.from("profiles").insert({id:data.user!.id,username:username||email.split("@")[0]}); alert("Created! Login now"); setIsSignUp(false)}
            }else{
              const {error}=await supabase.auth.signInWithPassword({email,password})
              if(error) alert(error.message)
            }
          }} style={{display:"flex",flexDirection:"column",gap:12}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required style={{padding:14,borderRadius:8,background:"#2a3942",border:"none",color:"white"}}/>
            {isSignUp&&<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required style={{padding:14,borderRadius:8,background:"#2a3942",border:"none",color:"white"}}/>}
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required style={{padding:14,borderRadius:8,background:"#2a3942",border:"none",color:"white"}}/>
            <button style={{padding:14,borderRadius:8,background:"#00a884",color:"white",fontWeight:700,border:"none"}}>{isSignUp?"Sign Up":"Login"}</button>
          </form>
          <p onClick={()=>setIsSignUp(!isSignUp)} style={{color:"#00a884",textAlign:"center",marginTop:16,cursor:"pointer"}}>{isSignUp?"Have account? Login":"Need account? Sign Up"}</p>
        </div>
      </div>
    )
  }

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#111b21"}}>
      <div style={{background:"#202c33",padding:14,display:"flex",justifyContent:"space-between"}}><b style={{color:"white"}}>ZaynChat</b><button onClick={()=>supabase.auth.signOut()} style={{background:"none",border:"none",color:"#aaa"}}>Logout</button></div>
      <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:8,background:"#0b141a"}}>
        {messages.map(m=><div key={m.id} style={{alignSelf:m.user_id===user.id?"flex-end":"flex-start",background:m.user_id===user.id?"#005c4b":"#202c33",color:"white",padding:"8px 12px",borderRadius:8,maxWidth:"75%"}}>{m.content}</div>)}
        <div ref={endRef}/>
      </div>
      <form onSubmit={async(e)=>{e.preventDefault(); if(!newMsg.trim()) return; const {data}=await supabase.from("profiles").select("username").eq("id",user.id).single(); await supabase.from("messages").insert({content:newMsg,user_id:user.id,username:data?.username||"User"}); setNewMsg("")}} style={{background:"#202c33",padding:10,display:"flex",gap:8}}>
        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type..." style={{flex:1,padding:12,borderRadius:20,border:"none",background:"#2a3942",color:"white"}}/>
        <button style={{width:44,height:44,borderRadius:"50%",background:"#00a884",border:"none",color:"white"}}>➤</button>
      </form>
    </div>
  )
}
