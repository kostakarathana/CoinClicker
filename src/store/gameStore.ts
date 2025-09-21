import create from 'zustand'

type Mode = 'demo' | 'real'

type FeedItem = { text: string; ts: number; self?: boolean }

type GameState = {
  balance: number
  pool: number
  lastClicker: string | null
  clicking: boolean
  feed: Array<FeedItem>
  // demo-only payout state and per-user click tracking
  payout: { active: boolean; amount: number } | null
  incDemoClick: () => void
  clearPayout: () => void
  pushFeed: (text: string, self?: boolean) => void
  mode: Mode
  setMode: (m: Mode) => void
  click: (who: string) => void
  reset: () => void
  // simulator controls
  startSimulator: () => void
  stopSimulator: () => void
}

let simInterval: number | null = null

function poissonSample(lambda: number) {
  // simple Knuth algorithm
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  while (p > L) {
    k++
    p *= Math.random()
  }
  return k - 1
}

export const useGameStore = create<GameState>((set, get) => ({
  balance: 10.0, // demo starting balance in USD
  pool: 0.0,
  lastClicker: null,
  payout: null,
  feed: [],
  clicking: false,
  mode: 'demo',
  // increment the client's demo click counter and trigger a payout on the 50th click
  incDemoClick: () => {
    try {
      const key = 'cc_demo_clicks'
      const raw = window.localStorage.getItem(key)
      let n = raw ? parseInt(raw, 10) : 0
      n = (n || 0) + 1
      window.localStorage.setItem(key, String(n))
      // only in demo mode
      const s = get()
      if (s.mode !== 'demo') return
      if (n === 50) {
        // determine jackpot amount (award current pool plus a bonus)
        const jackpot = parseFloat((s.pool + 5.0).toFixed(2))
        // apply payout: reset pool, increase balance for this client
        set(() => ({
          pool: 0.0,
          balance: parseFloat((s.balance + jackpot).toFixed(2)),
          payout: { active: true, amount: jackpot },
        }))
        // reset the counter so it only triggers once per 50 clicks
        window.localStorage.setItem(key, '0')
      }
    } catch (e) {
      // ignore storage errors
    }
  },
  clearPayout: () => set(() => ({ payout: null })),
  pushFeed: (text: string, self = false) =>
    set((s) => ({ feed: [{ text, ts: Date.now(), self }, ...s.feed].slice(0, 50) })),
  setMode: (m: Mode) => {
    set(() => ({ mode: m }))
    // when switching away from demo, stop simulator
    if (m !== 'demo') {
      const g = get()
      g.stopSimulator()
    }
  },
  click: (who: string) =>
    set((s) => {
      if (s.mode === 'real') {
        // real mode: placeholder behavior (nonfunctional) — still update lastClicker locally
        return { lastClicker: who }
      }
      if (s.balance < 0.02) return s
      const newBalance = parseFloat((s.balance - 0.02).toFixed(2))
      const newPool = parseFloat((s.pool + 0.02).toFixed(2))
      const text = `${who} clicked (+$0.02)`
      const self = who.toLowerCase() === 'you' || who === 'you'
      return {
        balance: newBalance,
        pool: newPool,
        lastClicker: who,
        feed: [{ text, ts: Date.now(), self }, ...s.feed].slice(0, 50),
      }
    }),
  reset: () =>
    set(() => ({
      balance: 10.0,
      pool: 0.0,
      lastClicker: null,
      mode: 'demo',
    })),
  startSimulator: () => {
    const state = get()
    if (simInterval != null || state.mode !== 'demo') return
    // target $100 / sec in total. Each click is $0.02 -> 5000 clicks/sec
    // We'll aggregate per tick (200ms) so expected clicks per tick = 1000
    const lambdaPerTick = 1000 // expected clicks per 200ms
    simInterval = window.setInterval(() => {
      const n = poissonSample(lambdaPerTick)
      if (n <= 0) return
      const amount = parseFloat((n * 0.02).toFixed(2))
      // show up to a small number of individual click events in the feed
      const visible = Math.min(n, 3)
      const items: FeedItem[] = []
      for (let i = 0; i < visible; i++) {
        const who = `user${Math.floor(Math.random() * 1000)}`
        items.push({ text: `${who} clicked (+$0.02)`, ts: Date.now(), self: false })
      }
      const rest = n - visible
      if (rest > 0) {
        // brief summary without huge numbers
        items.push({ text: `others were active (+$${((rest) * 0.02).toFixed(2)})`, ts: Date.now(), self: false })
      }
      // apply updates: pool increment and prepend feed items
      set((s) => ({
        pool: parseFloat((s.pool + amount).toFixed(2)),
        feed: [...items, ...s.feed].slice(0, 50),
        lastClicker: Math.random() < 0.5 ? items[0]?.text.split(' ')[0] : s.lastClicker,
      }))
    }, 200)
  },
  stopSimulator: () => {
    if (simInterval != null) {
      clearInterval(simInterval)
      simInterval = null
    }
  },
}))

export default useGameStore
