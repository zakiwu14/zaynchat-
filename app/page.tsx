'use client'
import { useState } from 'react'

export default function Home() {
  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column'}}>
      <header style={{height:'56px', background:'#111', color:'white', display:'flex', alignItems:'center', padding:'0 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'32px', height:'32px', background:'#6366f1', borderRadius:'8px'}}></div>
          <span style={{fontWeight:'bold'}}>ZaynChat</span>
        </div>
      </header>
      <main style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb'}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontSize:'48px', fontWeight:'bold', marginBottom:'16px'}}>Welcome to ZaynChat</h1>
          <p style={{color:'#6b7280'}}>Your chat app is deploying...</p>
          <button style={{marginTop:'24px', padding:'12px 24px', background:'#111', color:'white', borderRadius:'8px'}}>
            Start Chatting
          </button>
        </div>
      </main>
    </div>
  )
}
