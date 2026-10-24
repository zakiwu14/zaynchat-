'use client'
import { useEffect, useState, useRef } from 'react'

type Message = { id: string; content: string; username: string; time: string }

export default function ZaynChat(){
  const [messages,setMessages]=useState<Message[]>([
    {id:'1', content:'Welcome to ZaynChat! 🇬🇭', username:'Zayn', time:'now'},
    {id:'2', content:'Real-time messenger from Ghana!', username:'System', time:'now'}
  ])
  const [newMsg,setNewMsg]=useState('')
  const [username,setUsername]=useState('')
  const [joined,setJoined]=useState(false)
  const endRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[messages])

  const send= (e:React.FormEvent)=>{
    e.preventDefault()
    if(!newMsg.trim()) return
    setMessages([...messages, {id:Date.now().toString(), content:newMsg, username, time:'now'}])
    setNewMsg('')
  }

  if(!joined){
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(to bottom right, #0a0a0a, #1a1a2e)', padding:'16px'}}>
        <div style={{width:'100%', maxWidth:'400px', background:'#16161a', borderRadius:'24px', padding:'32px', border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{textAlign:'center', marginBottom:'32px'}}>
            <div style={{width:'64px', height:'64px', background:'#5865F2', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px', fontWeight:'bold', color:'white'}}>Z</div>
            <h1 style={{fontSize:'28px', fontWeight:'bold', color:'white'}}>ZaynChat</h1>
            <p style={{color:'rgba(255,255,255,0.6)', marginTop:'8px'}}>Real-time messenger from Ghana 🇬🇭</p>
          </div>
          <form onSubmit={(e)=>{e.preventDefault(); if(username.trim()) setJoined(true)}}>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter your name..." style={{width:'100%', background:'#2a2a30', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 16px', color:'white', outline:'none', marginBottom:'16px'}} required />
            <button type="submit" style={{width:'100%', background:'#5865F2', padding:'12px', borderRadius:'12px', fontWeight:'600', color:'white', border:'none', cursor:'pointer'}}>Join ZaynChat →</button>
          </form>
          <p style={{textAlign:'center', fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'24px'}}>Built by Zayn • zakiwu14 • Ghana</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', background:'#0f0f10'}}>
      <header style={{height:'56px', background:'#16161a', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', padding:'0 16px', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'32px', height:'32px', background:'#5865F2', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', color:'white'}}>Z</div>
          <span style={{fontWeight:'600', color:'white'}}>ZaynChat</span>
          <span style={{fontSize:'12px', background:'rgba(34,197,94,0.2)', color:'#4ade80', padding:'2px 8px', borderRadius:'999px'}}>● Live</span>
        </div>
        <div style={{fontSize:'14px', color:'rgba(255,255,255,0.6)'}}>{username} • Ghana</div>
      </header>
      <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
        {messages.map(m=>(
          <div key={m.id} style={{display:'flex', justifyContent:m.username===username?'flex-end':'flex-start'}}>
            <div style={{max
