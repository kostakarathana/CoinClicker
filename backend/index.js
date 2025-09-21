require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(RPC);
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// load artifact
const artifactPath = path.join(__dirname, '..', 'onchain', 'artifacts', 'contracts', 'LastClickPool.sol', 'LastClickPool.json');
let abi = null;
if (fs.existsSync(artifactPath)) {
  const art = JSON.parse(fs.readFileSync(artifactPath));
  abi = art.abi;
}

const POOL_ADDRESS = process.env.POOL_ADDRESS || '';

app.get('/status', async (req, res) => {
  try {
    if (!abi || !POOL_ADDRESS) return res.json({ ok: false, error: 'missing abi or pool address' });
    const contract = new ethers.Contract(POOL_ADDRESS, abi, provider);
    const info = await contract.getRoundInfo();
    // info contains BigNumber/BigInt values; convert to strings for JSON
    const start = info[0].toString();
    const end = info[1].toString();
    const index = info[2].toString();
    res.json({ ok: true, info: { start, end, index } });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/click', async (req, res) => {
  try {
    if (!abi || !POOL_ADDRESS) return res.json({ ok: false, error: 'missing abi or pool address' });
    if (!wallet) return res.json({ ok: false, error: 'no private key set' });
    const contract = new ethers.Contract(POOL_ADDRESS, abi, wallet);
    const tx = await contract.click({ value: ethers.parseEther('0.001') });
    const receipt = await tx.wait();
    res.json({ ok: true, tx: receipt.transactionHash });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post('/claim', async (req, res) => {
  try {
    if (!abi || !POOL_ADDRESS) return res.json({ ok: false, error: 'missing abi or pool address' });
    if (!wallet) return res.json({ ok: false, error: 'no private key set' });
    const contract = new ethers.Contract(POOL_ADDRESS, abi, wallet);
    const tx = await contract.claimWinner();
    const receipt = await tx.wait();
    res.json({ ok: true, tx: receipt.transactionHash });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on', PORT));

// --- Keeper (POC) -------------------------------------------------
// Poll the contract for round info. When we detect an active window, pick a random
// offset inside the 120s and schedule a single call to claimWinner at that offset.
// This is intentionally simple for the hackathon POC.

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function getContract() {
  if (!abi || !POOL_ADDRESS) return null;
  return new ethers.Contract(POOL_ADDRESS, abi, provider);
}

let keeperScheduledForRound = null;

async function pollKeeperLoop() {
  while (true) {
    try {
      const contract = await getContract();
      if (!contract) {
        console.log('[keeper] waiting for ABI and POOL_ADDRESS...');
        await sleep(3000);
        continue;
      }

      const [start, end, index] = await contract.getRoundInfo();
      const now = Math.floor(Date.now() / 1000);
      // start and end are unix timestamps (uint256)
      if (now >= Number(start) && now <= Number(end)) {
        if (keeperScheduledForRound === Number(index)) {
          // already scheduled for this round
        } else {
          // schedule a random offset inside the active window [now..end]
          const remaining = Number(end) - now;
          const offset = Math.floor(Math.random() * Math.max(1, remaining));
          const scheduledAt = Date.now() + offset * 1000;
          keeperScheduledForRound = Number(index);
          console.log(`[keeper] Active window detected for round ${index}. Scheduling claim in ${offset}s (at ${new Date(scheduledAt).toISOString()})`);

          // schedule the claim
          setTimeout(async () => {
            try {
              const signer = wallet || provider.getSigner();
              const c = new ethers.Contract(POOL_ADDRESS, abi, signer);
              console.log('[keeper] Calling claimWinner()...');
              const tx = await c.claimWinner();
              await tx.wait();
              console.log('[keeper] claimWinner tx sent and mined:', tx.hash || tx.transactionHash);
              // reset so next round can be scheduled
              keeperScheduledForRound = null;
            } catch (err) {
              console.error('[keeper] claim failed:', err?.message || err);
              keeperScheduledForRound = null;
            }
          }, offset * 1000);
        }
      } else {
        // not in active window
        // console.log('[keeper] not in active window', { now, start: Number(start), end: Number(end) });
      }
    } catch (err) {
      console.error('[keeper] error', err?.message || err);
    }
    await sleep(3000);
  }
}

pollKeeperLoop();

