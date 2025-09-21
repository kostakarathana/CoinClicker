let audioCtx: AudioContext | null = null
let bgAudio: HTMLAudioElement | null = null
let bgSource: MediaElementAudioSourceNode | null = null
let masterGain: GainNode | null = null
let muted = false

const MUSIC_URL = new URL('../assets/music_main.mp3', import.meta.url).href

export function initAudio() {
  if (audioCtx) return
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 1
    masterGain.connect(audioCtx.destination)

    bgAudio = new Audio(MUSIC_URL)
    bgAudio.loop = true
    bgAudio.volume = 0.45
    bgSource = audioCtx.createMediaElementSource(bgAudio)
    bgSource.connect(masterGain)
  } catch (e) {
    console.warn('Audio init failed', e)
    audioCtx = null
  }
}

export async function startBackground() {
  if (!audioCtx) initAudio()
  if (!audioCtx || !bgAudio) return
  try {
    if (audioCtx.state === 'suspended') await audioCtx.resume()
    await bgAudio.play()
  } catch (e) {
    // autoplay may be blocked; will play on next user gesture
    console.info('Autoplay blocked, will resume on user gesture')
  }
}

export function stopBackground() {
  if (bgAudio) bgAudio.pause()
}

export function setMuted(val: boolean) {
  muted = val
  if (masterGain) masterGain.gain.value = muted ? 0 : 1
  if (bgAudio) bgAudio.muted = muted
  try { localStorage.setItem('coinclicker-muted', muted ? '1' : '0') } catch {}
}

export function isMuted() {
  return muted
}

export function loadMutedFromStorage() {
  try {
    const v = localStorage.getItem('coinclicker-muted')
    muted = v === '1'
  } catch {}
}

// Play a quick chime using WebAudio (falls back to a tiny oscillator burst)
export function playChime() {
  if (!audioCtx) initAudio()
  if (!audioCtx) return
  try {
    const now = audioCtx.currentTime
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(880, now)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.12, now + 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    o.connect(g)
    g.connect(masterGain || audioCtx.destination)
    o.start(now)
    o.stop(now + 0.5)
  } catch (e) {
    // ignore
  }
}

// Initialize muted flag from storage on module load
loadMutedFromStorage()

export default {
  initAudio,
  startBackground,
  stopBackground,
  playChime,
  setMuted,
  isMuted,
}
