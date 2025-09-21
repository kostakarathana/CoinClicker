import React from 'react'
import useGameStore from '../store/gameStore'
import CoinButton from '../components/CoinButton'
import PayoutOverlay from '../components/PayoutOverlay'
import CoinRain from '../components/CoinRain'
import InfoButton from '../components/InfoButton'
import audio from '../lib/audio'
import { useState, useEffect } from 'react'
import { getStatus } from '../lib/backend'

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function Home() {
  const balance = useGameStore((s) => s.balance)
  const pool = useGameStore((s) => s.pool)
  const lastClicker = useGameStore((s) => s.lastClicker)
  const reset = useGameStore((s) => s.reset)
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const startSimulator = useGameStore((s) => s.startSimulator)
  const stopSimulator = useGameStore((s) => s.stopSimulator)
  const feed = useGameStore((s) => s.feed)
  const [status, setStatus] = useState<any>(null)
  const [muted, setMuted] = useState<boolean>(audio.isMuted())

  useEffect(() => {
    setMuted(audio.isMuted())
  }, [])

  useEffect(() => {
    let mounted = true
    async function poll() {
      try {
        const r = await getStatus()
        if (mounted) setStatus(r)
      } catch (e) {}
      setTimeout(() => { if (mounted) poll() }, 3000)
    }
    poll()
    return () => { mounted = false }
  }, [])

  // meter removed — no mount animation needed

  useEffect(() => {
    if (mode === 'demo') startSimulator()
    else stopSimulator()
    return () => { stopSimulator() }
  }, [mode])

  function toggleMute() {
    const next = !muted
    audio.setMuted(next)
    setMuted(next)
  }

  return (
    <div className="app">
      <PayoutOverlay />
      <CoinRain />
      <InfoButton />
      <header className="header">
        <div className="brand">
          <h1 className="logo">CoinClicker</h1>
          <div className="tag">Fast • Fair • Fun</div>
        </div>
        {/* header mode toggle removed — use side-panel mode switch */}
      </header>

      <main className="main">
        <section className="left">
          <div className="panel pool-card">
            <div className="pool-amount">${pool.toFixed(2)}</div>
            <div className="pool-meta">Current Pool</div>
            {/* house cut and last clicker removed per user request */}
          </div>

        </section>

        <div className="center">
          <div className="coin-stage">
            <CoinButton />
            <div className="hint big">Click to play • Last click wins</div>
          </div>
        </div>

        <aside className="right">
          <section className="panel wallet-panel">
            <div className="panel-title">Wallet (dev)</div>
            <div className="wallet-balance">${balance.toFixed(2)}</div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn" onClick={reset}>Reset Demo</button>
              <button className="btn" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
              <button
                className="btn"
                onClick={() => {
                  audio.startBackground().catch(() => {})
                  audio.setMuted(false)
                  setMuted(false)
                }}
              >Play Music</button>
            </div>

            <div style={{marginTop:12,display:'flex',gap:8,alignItems:'center'}}>
              <label style={{color:'var(--muted)',fontSize:13}}>Mode:</label>
              <button className="btn" onClick={() => setMode(mode === 'demo' ? 'real' : 'demo')}>{mode === 'demo' ? 'Switch to Real' : 'Switch to Demo'}</button>
            </div>
          </section>

          <section className="panel small-panel">
            <div className="panel-title">Live Feed</div>
            <div className="feed">
              {feed && feed.length > 0 ? (
                <ul className="feed-list">
                  {feed.map((f, idx) => (
                    <li key={idx} className={`feed-item ${f.self ? 'self' : ''}`}>
                      <div className="feed-text">{f.text}</div>
                      <div className="feed-meta">
                        <span className="feed-time">{timeAgo(f.ts)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="muted">No events yet — start clicking!</div>
              )}
            </div>
          </section>

          <section className="panel small-panel">
            <div className="panel-title">Contract Status</div>
            <div style={{padding:12,fontSize:13}}>
              {status && status.ok ? (
                <div>
                  <div>Round start: {status.info.start}</div>
                  <div>Round end: {status.info.end}</div>
                  <div>Round index: {status.info.index}</div>
                </div>
              ) : (
                <div className="muted">No on-chain status</div>
              )}
            </div>
          </section>
        </aside>
      </main>

  <footer className="footer"></footer>
    </div>
  )
}
