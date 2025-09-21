import React, { useState, useRef, useEffect } from 'react'
import useGameStore from '../store/gameStore'
import audio from '../lib/audio'
import { clickOnBackend } from '../lib/backend'
const coinMain = new URL('../assets/coin_main.png', import.meta.url).href

type Props = {
  who?: string
}

type Particle = {
  id: number
  dx: number
  dy: number
  rot: number
  launched?: boolean
  fading?: boolean
}

export default function CoinButton({ who = 'you' }: Props) {
  const click = useGameStore((s) => s.click)
  const clicking = useGameStore((s) => s.clicking)
  const incDemo = useGameStore((s) => s.incDemoClick)
  const mode = useGameStore((s) => s.mode)
  const [particles, setParticles] = useState<Particle[]>([])
  const nextId = useRef<number>(1)

  useEffect(() => {
    return () => {
      // cleanup on unmount
      setParticles([])
    }
  }, [])

  function burst() {
    const count = 12
    const newParts: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 60 + Math.random() * 140 // px
      const dx = Math.cos(angle) * speed
      const dy = Math.sin(angle) * speed
      const rot = Math.random() * 360
      newParts.push({ id: nextId.current++, dx, dy, rot, launched: false })
    }
    // add new particles (newest first) and keep limit
    setParticles((p) => [...newParts, ...p].slice(0, 80))
    const ids = newParts.map((n) => n.id)
    // launch only the newly created particles in the next tick so CSS transition triggers
    setTimeout(() => {
      setParticles((p) => p.map((x) => (ids.includes(x.id) ? { ...x, launched: true } : x)))
    }, 20)
    // start fade after a short delay so they visibly move, then remove after fade ends
    const fadeDelay = 700
    const removeDelay = 1100
    setTimeout(() => {
      setParticles((p) => p.map((x) => (ids.includes(x.id) ? { ...x, fading: true } : x)))
    }, fadeDelay)
    setTimeout(() => {
      setParticles((p) => p.filter((x) => !ids.includes(x.id)))
    }, removeDelay)
  }

  return (
    <div style={{position:'relative'}} className="coin-wrapper">
      <button
        className="coin coin-btn"
        aria-label="Click coin"
        onClick={() => {
          click(who)
          // call backend to register an on-chain click (best-effort)
          clickOnBackend().then((r) => console.log('backend click:', r)).catch((e) => console.warn('backend click err', e));
          try { audio.playChime() } catch {}
          burst()
          // increment demo-only click counter which may trigger a payout
          try {
            if (mode === 'demo') incDemo()
          } catch {}
        }}
        disabled={clicking}
      >
        <img src={coinMain} alt="coin" className="coin-image" />
      </button>

      {/* particles */}
      {particles.map((pt) => (
        <img
          key={pt.id}
          src={coinMain}
          alt="coin-particle"
          className={`particle ${pt.launched ? 'launched' : ''}`}
          style={{
            ['--dx' as any]: `${pt.dx}px`,
            ['--dy' as any]: `${pt.dy}px`,
            ['--rot' as any]: `${pt.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}
