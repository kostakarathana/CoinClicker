// Popup script: richer coin animation + demo persistence
const STORAGE_KEY = 'cc_ext_demo_clicks';
const CREDITS_PER_CLICK = 0.02;
const DEMO_JACKPOT = 5.0;

const $ = (s) => document.querySelector(s);

const countEl = $('#count');
const creditsEl = $('#credits');
const eventsEl = $('#events');
const overlay = $('#overlay');
const coinEl = $('#coin');
const closeOverlay = $('#closeOverlay');
const particleLayer = $('#particleLayer');

// Hide fallback circle when the coin image is present
const coinImg = document.getElementById('coinImg');
if (coinImg){
  coinImg.addEventListener('load', ()=>{ 
    coinEl.classList.add('has-image'); 
    // remove fallback face so it cannot overlap the real coin image
    const face = coinEl.querySelector('.coin-face');
    if (face) face.remove();
  });
  coinImg.addEventListener('error', ()=>{ coinEl.classList.remove('has-image'); coinImg.style.display='none' });
  // if already cached and complete, mark and remove the fallback face immediately
  if (coinImg.complete && coinImg.naturalWidth !== 0) {
    coinEl.classList.add('has-image');
    const face = coinEl.querySelector('.coin-face');
    if (face) face.remove();
  }
}

function readState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {clicks:0,credits:0,events:[]};
  try { return JSON.parse(raw); } catch(e){ return {clicks:0,credits:0,events:[]} }
}

function writeState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function formatDollar(n){ return '$' + n.toFixed(2); }

function render(){
  const s = readState();
  countEl.textContent = s.clicks;
  creditsEl.textContent = formatDollar(s.credits);
  eventsEl.innerHTML = '';
  for (let i = s.events.length-1; i >=0; i--){
    const li = document.createElement('li');
    li.textContent = s.events[i];
    eventsEl.appendChild(li);
  }
}

function spawnParticle(x,y,opts={}){
  // prefer image-based coin particle when the asset exists; otherwise fall back to a colored div
  const imgPath = 'assets/coin.png';
  const useImage = true; // we assume the user added the file to extension/assets/

  let p;
  if (useImage) {
    p = document.createElement('img');
    p.src = imgPath;
    p.alt = 'coin';
    p.className = 'particle payout-coin';
    // smaller image for small particles
    p.style.width = (opts.size || 48) + 'px';
    p.style.height = (opts.size || 48) + 'px';
  } else {
    p = document.createElement('div');
    p.className = 'particle';
  }

  p.style.position = 'absolute';
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  particleLayer.appendChild(p);

  const rot = (Math.random()-0.5)*720;
  const vx = (Math.random()-0.5) * (opts.spread||300);
  const vy = - (200 + Math.random() * (opts.up||300));
  const duration = opts.duration || (900 + Math.random()*800);

  p.animate([
    { transform: `translate(0px,0px) rotate(0deg) scale(1)`, opacity:1 },
    { transform: `translate(${vx}px, ${vy}px) rotate(${rot}deg) scale(1)`, opacity:1, offset:0.6 },
    { transform: `translate(${vx*1.2}px, ${vy+420}px) rotate(${rot*1.3}deg) scale(0.6)`, opacity:0 }
  ], { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });

  setTimeout(()=>{ p.remove(); }, duration+60);
}

function burst(centerEl, count=20){
  const rect = centerEl.getBoundingClientRect();
  const centerX = rect.left + rect.width/2;
  const centerY = rect.top + rect.height/2;
  for (let i=0;i<count;i++){
    setTimeout(()=>{
      const jitterX = centerX + (Math.random()-0.5)*rect.width;
      const jitterY = centerY + (Math.random()-0.5)*rect.height;
      spawnParticle(jitterX, jitterY, { spread: 500, up: 380, duration: 1000 + Math.random()*800 });
    }, i*18);
  }
}

function recordEvent(text){
  const s = readState();
  s.events = s.events || [];
  s.events.push(text);
  if (s.events.length > 80) s.events.shift();
  writeState(s);
}

// clicking or keyboard activating the main coin
coinEl.addEventListener('click', (e)=>{
  const s = readState();
  s.clicks = (s.clicks||0) + 1;
  s.credits = (s.credits||0) + CREDITS_PER_CLICK;
  recordEvent(`Click #${s.clicks} (+${formatDollar(CREDITS_PER_CLICK)})`);
  writeState(s);
  render();

  // spawn small particles around the button for feedback
  burst(e.currentTarget, 6);

  if (s.clicks % 50 === 0){
    recordEvent(`DEMO PAYOUT: You won ${formatDollar(DEMO_JACKPOT)} on click #${s.clicks}`);
    s.credits += DEMO_JACKPOT;
    writeState(s);
    // show overlay and big burst
    setTimeout(()=>{
      $('#jackpotAmount').textContent = formatDollar(DEMO_JACKPOT);
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden','false');
      // large burst from coin center
      burst(coinEl, 36);
      // spawn a few larger payout coins that fly up like the main app
      const rect = coinEl.getBoundingClientRect();
      const centerX = rect.left + rect.width/2;
      const centerY = rect.top + rect.height/2;
      for (let i=0;i<8;i++){
        setTimeout(()=>{
          spawnParticle(centerX + (Math.random()-0.5)*rect.width, centerY + (Math.random()-0.5)*rect.height, { spread: 260, up: 420, duration: 1400 + Math.random()*700, size: 84 });
        }, i*80)
      }
      render();
    }, 140);
  }
});

// keyboard accessibility (Enter / Space)
coinEl.addEventListener('keydown', (ev)=>{
  if (ev.key === 'Enter' || ev.key === ' ') {
    ev.preventDefault();
    coinEl.click();
  }
});

closeOverlay.addEventListener('click', ()=>{
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
});

// init
render();

// header long-press to clear
const brand = document.querySelector('.brand');
let holdTimer = null;
brand.addEventListener('mousedown', ()=>{ holdTimer = setTimeout(()=>{
  if (confirm('Clear demo state?')){ localStorage.removeItem(STORAGE_KEY); render(); recordEvent('State cleared'); }
},700)});
brand.addEventListener('mouseup', ()=>{ if (holdTimer) clearTimeout(holdTimer); holdTimer=null });
