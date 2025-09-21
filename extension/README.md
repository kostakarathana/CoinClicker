CoinClicker Mini — Chrome extension (frontend-only demo)

What this is

- A small Chrome extension containing a popup UI that mimics the CoinClicker demo.
- Client-only demo: click to earn play credits; every 50th click shows a demo payout overlay with coin animation.
- State is stored in Chrome extension localStorage (persisted per extension origin).

Files added

- `manifest.json` — MV3 manifest for the extension.
- `popup.html`, `popup.css`, `popup.js` — the popup UI.
- `icons/` — placeholder icons (small PNGs). Replace with your artwork.

How to load locally

1. Open Chrome (or Chromium-based browser) and navigate to chrome://extensions
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `extension/` directory in this repo.
4. Click the extension icon in the toolbar and use the popup.

Notes

- This is a frontend-only demo. No backend or on-chain integration in the extension.
- The demo payout is deterministic: every 50th click triggers the overlay and awards the demo jackpot amount to local credits.
- Replace or add icons under `extension/icons/` for branding.

Tip: the extension expects a coin image at `extension/assets/coin.png` (you already added it). If you want to use a different file, place it there and name it `coin.png`.

If you want to copy from the main app image, copy `src/assets/coin_main.png` to `extension/assets/coin.png`.

When `assets/coin.png` is present the popup will show the same coin image used in the main app. If the image is missing the popup falls back to the built-in coin face.

