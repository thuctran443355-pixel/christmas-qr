// Cập nhật: name-rain sống động bằng canvas (dòng chảy lãng mạn + chút "hacker").
// Giữ lại các hiệu ứng thiệp, typewriter, confetti, và tôn trọng prefers-reduced-motion.

(() => {
  const openBtn = document.getElementById('openBtn');
  const welcome = document.getElementById('welcome');
  const card = document.getElementById('card');
  const cardInner = document.getElementById('cardInner');
  const cardTitle = document.getElementById('cardTitle');
  const cardMsg = document.getElementById('cardMsg');
  const confettiCanvas = document.getElementById('confetti');
  const nameRainCanvas = document.getElementById('nameRainCanvas');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Config
  const recipient = 'Tuyết Mai';
  const titleText = `Chúc mừng sinh nhật ${recipient}!`;
  const messageText = `Chúc ${recipient} một tuổi mới rực rỡ — nhiều niềm vui, sức khoẻ, và những điều bất ngờ ngọt ngào.`;

  // INITIAL SETUP
  cardTitle.textContent = titleText;
  cardMsg.textContent = '';

  // Event bindings
  openBtn.addEventListener('click', onOpen);
  openBtn.addEventListener('keyup', (e) => { if(e.key === 'Enter' || e.key === ' ') onOpen(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') resetToWelcome(); });

  // 3D tilt
  function bindTilt(elem, intensity = 14){
    function onMove(e){
      const r = elem.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      const rx = -dy * intensity;
      const ry = dx * intensity;
      elem.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(12px)`;
    }
    function onLeave(){ elem.style.transform = ''; }
    if(!prefersReduced){
      window.addEventListener('mousemove', onMove);
      elem.addEventListener('mouseleave', onLeave);
    }
  }
  bindTilt(cardInner, 10);

  // Typewriter
  function typeWriter(el, text, delay = 24){
    return new Promise(resolve => {
      let i = 0;
      el.textContent = '';
      const t = setInterval(()=>{
        el.textContent = text.slice(0, ++i);
        if(i >= text.length){ clearInterval(t); resolve(); }
      }, delay);
    });
  }

  // OPEN SEQUENCE
  async function onOpen(){
    openBtn.disabled = true;
    openBtn.classList.add('pressed');
    await flashWelcome();
    welcome.setAttribute('aria-hidden','true');
    welcome.classList.add('hidden');

    // reveal card
    card.classList.remove('hidden');
    card.classList.add('show');
    card.setAttribute('aria-hidden','false');

    // typewriter for title and message
    await typeWriter(cardTitle, titleText, 20);
    await new Promise(r => setTimeout(r, 380));
    await typeWriter(cardMsg, messageText, 18);
    cardMsg.style.opacity = '1';
    cardMsg.style.transform = 'translateY(0)';

    // chime & confetti
    if(!prefersReduced){
      playChime();
      startConfettiBurst();
    }
  }

  async function flashWelcome(){
    const el = welcome;
    el.style.transition = 'filter 220ms ease, transform 260ms ease, opacity 260ms ease';
    el.style.filter = 'brightness(1.18) saturate(1.06)';
    el.style.transform = 'scale(1.02)';
    await new Promise(r => setTimeout(r, 260));
    el.style.filter = '';
    el.style.transform = '';
    await new Promise(r => setTimeout(r, 120));
  }

  function resetToWelcome(){
    card.classList.add('hidden');
    card.setAttribute('aria-hidden','true');
    welcome.classList.remove('hidden');
    welcome.setAttribute('aria-hidden','false');
    openBtn.disabled = false;
    cardMsg.style.opacity = '0';
    cardMsg.style.transform = 'translateY(8px)';
    cardTitle.textContent = titleText;
    cardMsg.textContent = '';
  }

  // --- CONFETTI (same as before) ---
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiRAF = null;
  function fitConfettiCanvas(){
    const dpr = devicePixelRatio || 1;
    confettiCanvas.width = innerWidth * dpr;
    confettiCanvas.height = innerHeight * dpr;
    confettiCanvas.style.width = innerWidth + 'px';
    confettiCanvas.style.height = innerHeight + 'px';
    confettiCtx = confettiCanvas.getContext('2d');
    confettiCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  fitConfettiCanvas();
  window.addEventListener('resize', fitConfettiCanvas);

  function makeConfetti(x,y,burst){
    return {
      x,y,
      vx: (Math.random()-0.5) * (burst ? 6 : 2),
      vy: (Math.random()-0.5) * (burst ? 6 : 1) - (burst ? 4 : 2),
      size: 6 + Math.random()*12,
      rot: Math.random()*Math.PI*2,
      vrot: (Math.random()-0.5)*0.2,
      col: ['#ff6b8f','#ffd89b','#7c4dff','#34d399'][Math.floor(Math.random()*4)],
      life: 0
    };
  }

  function startConfettiBurst(){
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height*0.28;
    for(let i=0;i<160;i++) confettiParticles.push(makeConfetti(cx + (Math.random()-0.5)*220, cy + (Math.random()-0.5)*60, true));
    if(!confettiRAF) confettiLoop();
    const rain = setInterval(()=> {
      for(let i=0;i<6;i++) confettiParticles.push(makeConfetti(Math.random()*innerWidth, -10, false));
      if(confettiParticles.length > 900) clearInterval(rain);
    }, 520);
  }

  function confettiLoop(){
    confettiRAF = requestAnimationFrame(confettiLoop);
    if(!confettiCtx) return;
    confettiCtx.clearRect(0,0,innerWidth, innerHeight);
    for(let i=confettiParticles.length-1;i>=0;i--){
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.rot += p.vrot;
      p.life += 1;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.col;
      confettiCtx.globalAlpha = Math.max(0, 1 - p.life/300);
      confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      confettiCtx.restore();
      if(p.y > innerHeight + 40 || p.life > 420) confettiParticles.splice(i,1);
    }
    if(confettiParticles.length === 0){
      cancelAnimationFrame(confettiRAF);
      confettiRAF = null;
    }
  }

  if(prefersReduced){
    confettiCanvas.style.display = 'none';
  }

  // --- NAME RAIN (canvas-based, flowing columns with romantic + hacker bits) ---
  const nr = {
    canvas: nameRainCanvas,
    ctx: null,
    streams: [],
    running: false,
    lastT: 0
  };

  function fitNameCanvas(){
    const dpr = devicePixelRatio || 1;
    nr.canvas.width = innerWidth * dpr;
    nr.canvas.height = innerHeight * dpr;
    nr.canvas.style.width = innerWidth + 'px';
    nr.canvas.style.height = innerHeight + 'px';
    nr.ctx = nr.canvas.getContext('2d');
    nr.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  fitNameCanvas();
  window.addEventListener('resize', fitNameCanvas);

  // Characters pool: mix romantic letters, small hearts, and binary (hacker feel)
  const CHAR_POOL = 'tuyetmai';
  function pickChar(name){
    // occasionally return a chunk of the recipient name or a heart
    const r = Math.random();
    if(r < 0.06) return '♥';
    if(r < 0.12) return '♡';
    if(r < 0.18) return String.fromCharCode(0x2022 + Math.floor(Math.random()*6)); // dots
    if(r < 0.35) {
      // pick a random letter from recipient with soft chance of upper-case
      const s = name[Math.floor(Math.random()*name.length)];
      return (Math.random() < 0.08) ? s.toUpperCase() : s;
    }
    // binary/hacker digits occasionally
    return (Math.random() < 0.2) ? (Math.random()<0.5 ? '0' : '1') : CHAR_POOL[Math.floor(Math.random()*CHAR_POOL.length)];
  }

  function initStreams(){
    nr.streams.length = 0;
    const columns = Math.max(14, Math.floor(innerWidth / 36)); // adapt to width
    for(let i=0;i<columns;i++){
      const x = (i + 0.5) * (innerWidth / columns);
      const speed = 30 + Math.random()*80; // px/s
      const fontSize = 12 + Math.random()*26;
      const amplitude = 6 + Math.random()*26; // horizontal sway
      const phase = Math.random()*Math.PI*2;
      const hue = 320 + Math.random()*40; // pink/purple base
      nr.streams.push({
        x, speed, fontSize, amplitude, phase, hue,
        offset: Math.random() * innerHeight * -1,
        // each stream holds its own drops (y positions)
        drops: []
      });
    }
    // populate initial drops for each stream
    nr.streams.forEach(s => {
      const count = Math.floor(innerHeight / (s.fontSize * 1.2)) + 4;
      for(let k=0;k<count;k++){
        s.drops.push({
          y: s.offset - k * (s.fontSize * 1.12),
          char: pickChar(recipient),
          life: Math.random()*1.6
        });
      }
    });
  }

  function drawNameRain(t){
    if(!nr.running) return;
    const ctx = nr.ctx;
    const w = innerWidth, h = innerHeight;
    const dt = (t - nr.lastT) / 1000 || 0.016;
    nr.lastT = t;

    // slight translucent fill for trailing effect (not full clear)
    ctx.fillStyle = 'rgba(6,10,20,0.12)';
    ctx.fillRect(0,0,w,h);

    nr.streams.forEach((s, si) => {
      // update offset
      s.offset += s.speed * dt;

      // if offset surpasses height, reset to loop
      if(s.offset > h + s.fontSize * 6) s.offset = -Math.random()*h*0.6;

      // for each potential row index draw a character
      const rows = Math.ceil(h / (s.fontSize * 1.06)) + 6;
      for(let r=0;r<rows;r++){
        const y = s.offset + r * (s.fontSize * 1.06);
        // skip if off-screen
        if(y < -s.fontSize || y > h + s.fontSize) continue;
        // decide whether to draw this cell this frame
        const lifeFactor = ((s.offset + r) % (h + 200)) / (h + 200);
        // pick character with some randomness (but update occasionally)
        if(Math.random() < 0.12) {
          // refresh char occasionally for flicker effect
          const char = pickChar(recipient);
          s.drops[r] = s.drops[r] || {};
          s.drops[r].char = char;
        }
        const ch = (s.drops[r] && s.drops[r].char) ? s.drops[r].char : pickChar(recipient);

        // x sway based on time and row for flowing effect
        const sway = Math.sin((t * 0.001) * (0.6 + si*0.02) + r * 0.12 + s.phase) * s.amplitude;
        const x = s.x + sway;

        // color blending: romantic pastel + occasional hacker neon green flicker
        let color;
        if(Math.random() < 0.006) {
          color = `rgba(90,255,120,${0.9 - lifeFactor*0.5})`; // hacker neon flicker
        } else {
          // pastel gradient based on hue and lifeFactor
          const h1 = s.hue + Math.sin(r * 0.14 + si) * 8;
          const sat = 72 + Math.sin(si*0.6)*12;
          const light = 62 - lifeFactor*18;
          color = `hsl(${h1}, ${sat}%, ${light}%)`;
        }

        // shadow/glow for romantic look
        ctx.font = `${Math.round(s.fontSize)}px "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        // glow
        ctx.shadowColor = color;
        ctx.shadowBlur = Math.max(8, s.fontSize * 0.6);
        ctx.globalAlpha = 0.88 - Math.abs(0.5 - lifeFactor) * 0.7;

        // draw slightly larger blurred copy for soft bloom
        ctx.save();
        ctx.translate(x, y);
        ctx.fillText(ch, 0, 0);
        ctx.restore();

        // small binary/hacker streak overlay for some cells
        if(Math.random() < 0.04) {
          ctx.globalAlpha = 0.28;
          ctx.shadowBlur = 2;
          ctx.fillStyle = 'rgba(160,255,180,0.14)';
          ctx.fillText(Math.random() < 0.5 ? '0' : '1', x + (Math.random()-0.5)*8, y + (Math.random()-0.5)*6);
        }

        // restore alpha
        ctx.globalAlpha = 1;
      }
    });

    requestAnimationFrame(drawNameRain);
  }

  function startNameRain(){
    if(prefersReduced) {
      nameRainCanvas.style.display = 'none';
      return;
    }
    nameRainCanvas.style.display = 'block';
    nr.running = true;
    nr.lastT = performance.now();
    initStreams();
    // warm background (clear)
    nr.ctx.fillStyle = 'rgba(6,10,20,1)';
    nr.ctx.fillRect(0,0,innerWidth,innerHeight);
    requestAnimationFrame(drawNameRain);
  }

  function stopNameRain(){
    nr.running = false;
    // clear canvas
    if(nr.ctx){
      nr.ctx.clearRect(0,0,innerWidth,innerHeight);
    }
  }

  // --- small chime using WebAudio ---
  let audioCtx = null;
  function ensureAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  function playChime(){
    if(prefersReduced) return;
    ensureAudio();
    const now = audioCtx.currentTime;
    const freqs = [440, 554.37, 659.25];
    const master = audioCtx.createGain(); master.connect(audioCtx.destination); master.gain.value = 0.08;
    freqs.forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, now + i*0.06);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.001, now + i*0.06);
      g.gain.exponentialRampToValueAtTime(1, now + i*0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i*0.06 + 0.4);
      o.connect(g); g.connect(master);
      o.start(now + i*0.06);
      o.stop(now + i*0.06 + 0.46);
    });
  }

  // Start name rain immediately (background ambient)
  startNameRain();

  // Accessibility: if reduced motion, stop heavy effects
  if(prefersReduced){
    stopNameRain();
    confettiCanvas.style.display = 'none';
  }

  // expose reset for debugging
  window.__resetSurprise = resetToWelcome;

})();
