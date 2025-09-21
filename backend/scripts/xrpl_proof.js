/*
  XRPL proof helper (Node.js)
  - Requires: npm install xrpl dotenv
  - Usage:
      FLARE_CONTRACT_ADDR=0x... XRPL_SEED=s████████ node xrpl_proof.js
  - It will submit a small Testnet Payment with a Memo containing the Flare contract address
*/
require('dotenv').config();
const xrpl = require('xrpl');

async function main() {
  const contract = process.env.FLARE_CONTRACT_ADDR || process.argv[2];
  const seed = process.env.XRPL_SEED || process.argv[3];
  if (!contract || !seed) {
    console.error('Usage: FLARE_CONTRACT_ADDR=0x.. XRPL_SEED=seed node xrpl_proof.js');
    process.exit(1);
  }
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  const wallet = xrpl.Wallet.fromSeed(seed);
  console.log('Using XRPL account:', wallet.classicAddress);

  const prepared = await client.autofill({
    TransactionType: 'Payment',
    Account: wallet.classicAddress,
    Amount: '1000000', // 0.001 XRP
    Destination: wallet.classicAddress, // self-payment for proof
    Memos: [ { Memo: { MemoData: Buffer.from(contract).toString('hex') } } ]
  });

  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);
  console.log('Submitted XRPL proof tx:', tx.result.hash);
  await client.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
