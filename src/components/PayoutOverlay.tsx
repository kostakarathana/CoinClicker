import React, { useEffect, useState, useRef } from 'react'
import useGameStore from '../store/gameStore'
const coinMain = new URL('../assets/coin_main.png', import.meta.url).href

type Particle = { id: number; kind: 'coin' | 'conf'; left: number; top: number; dur: number; rot?: number; color?: string }

export default function PayoutOverlay() {
  const payout = useGameStore((s) => s.payout)
  const clear = useGameStore((s) => s.clearPayout)
  const [parts, setParts] = useState<Particle[]>([])
  const spawnRef = useRef<number | null>(null)

  useEffect(() => {
    if (!payout || !payout.active) return

    // intense spawn: spawn coins + confetti rapidly
    spawnRef.current = window.setInterval(() => {
      setParts((existing) => {
        const batch: Particle[] = []
        // spawn 4-8 coins at a time
        const coins = 4 + Math.floor(Math.random() * 5)
        for (let i = 0; i < coins; i++) {
          batch.push({
            id: Date.now() + Math.floor(Math.random() * 100000) + i,
            kind: 'coin',
            left: 5 + Math.random() * 90,
            top: 70 + Math.random() * 25,
            dur: 900 + Math.floor(Math.random() * 1600),
            rot: Math.floor(Math.random() * 720),
          })
        }
        // spawn some confetti pieces
        const conf = 6 + Math.floor(Math.random() * 8)
        const colors = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#f9c74f']
        for (let j = 0; j < conf; j++) {
          batch.push({
            id: Date.now() + Math.floor(Math.random() * 100000) + coins + j,
            kind: 'conf',
            left: 5 + Math.random() * 90,
            top: 70 + Math.random() * 25,
            dur: 700 + Math.floor(Math.random() * 1400),
            color: colors[Math.floor(Math.random() * colors.length)],
          })
        }
        return [...existing, ...batch].slice(-600)
      })
    }, 140)

    // keep overlay slightly longer so the effect feels big
    const t = window.setTimeout(() => {
      clear()
    }, 6000)

    return () => {
      if (spawnRef.current != null) clearInterval(spawnRef.current)
      clearTimeout(t)
      setParts([])
      spawnRef.current = null
    }
  }, [payout])

  if (!payout || !payout.active) return null

  return (
    <div className="payout-overlay intense">
      <div className="payout-card intense">
        <h1 className="payout-title huge">JACKPOT!</h1>
        <div className="payout-amount huge-amt">${payout.amount.toFixed(2)}</div>
        <div className="payout-coins" aria-hidden>
          {parts.map((p) =>
            p.kind === 'coin' ? (
              <img
                key={p.id}
                src={coinMain}
                className="payout-coin intense-coin"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  animationDuration: `${p.dur}ms`,
                  transform: `translate(-50%,-50%) rotate(${p.rot}deg)`,
                }}
                onAnimationEnd={() => setParts((arr) => arr.filter((x) => x.id !== p.id))}
              />
            ) : (
              <div
                key={p.id}
                className="payout-confetti"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  background: p.color,
                  animationDuration: `${p.dur}ms`,
                }}
                onAnimationEnd={() => setParts((arr) => arr.filter((x) => x.id !== p.id))}
              />
            ),
          )}
        </div>
      </div>
    </div>
  )
}
