import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import audio from './lib/audio'

// Try to start background audio on mount; browsers may block until a user gesture.
audio.initAudio()
audio.startBackground().catch(() => {})

// Ensure a user gesture will resume audio if autoplay was blocked
window.addEventListener('click', () => audio.startBackground().catch(() => {}), { once: true })

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
