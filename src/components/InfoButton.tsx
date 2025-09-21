import React, { useState } from 'react'

export default function InfoButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="info-btn" onClick={() => setOpen(true)} aria-label="Info">
        ℹ️
      </button>

      {open && (
        <div className="info-modal" role="dialog" aria-modal="true">
          <div className="info-panel">
            <button className="info-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            <h3 className="info-title">How CoinClicker works</h3>
            <div className="info-body">
              <ul>
                <li>Each click costs $0.02 (demo currency).</li>
                <li>Clicks add to the shared pool. In demo mode many simulated users also click.</li>
                <li>In demo mode, every user's 50th click triggers a jackpot celebration locally.</li>
                <li>The last real click before the timer ends wins the pool in the real game (demo sim only).</li>
                <li>This demo doesn't perform real payments — it's for presentation only.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
