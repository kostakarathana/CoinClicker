import React, { useEffect, useState } from 'react'
const coinMain = new URL('../assets/coin_main.png', import.meta.url).href

type RainCoin = { id: number; left: number; size: number; duration: number; delay: number }

export default function CoinRain() {
  const [coins, setCoins] = useState<RainCoin[]>([])

  useEffect(() => {
    let mounted = true
    // spawn a coin every ~220ms
    const interval = window.setInterval(() => {
      if (!mounted) return
      setCoins((prev) => {
        const id = Date.now() + Math.floor(Math.random() * 1000)
        const left = Math.random() * 100
        const size = 12 + Math.random() * 28 // px
        const duration = 3500 + Math.random() * 4000 // ms
        const delay = Math.random() * 800
        const next = [...prev, { id, left, size, duration, delay }]
        // keep at most 120 coins memoized
        return next.slice(-140)
      })
    }, 220)

    return () => {
      mounted = false
      clearInterval(interval)
      setCoins([])
    }
  }, [])

  return (
    <div className="coin-rain" aria-hidden>
      {coins.map((c) => (
        <img
          key={c.id}
          src={coinMain}
          className="coin-rain-item"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDuration: `${c.duration}ms`,
            animationDelay: `${c.delay}ms`,
            opacity: 0.18 + Math.random() * 0.22,
          }}
        />
      ))}
    </div>
  )
}
