(() => {
  'use strict';
  const canvas = document.getElementById('particle-field');
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const scenes = [...document.querySelectorAll('.scene')];
  scenes[0]?.prepend(canvas);

  const state = { scene: 0, blend: 0, energy: 0, frames: 0, enabled: !media.matches };
  let w = 0, h = 0, dpr = 1, raf = 0, last = 0, time = 0, px = 0, py = 0, tx = 0, ty = 0, small = false, ghost = null;
  let interval = 16, frameCost = 8, samples = 0;

  // Depth is quantised into buckets so one frame costs a dozen batched fills, not ~1900 separate ones.
  const LEVELS = 12, LINE_LEVELS = 8;
  const CAP = 2048, LINE_CAP = 1200, STAR_CAP = 128;
  const dotFill = new Array(LEVELS), glowFill = new Array(LEVELS), lineStroke = new Array(LINE_LEVELS), starFill = new Array(4);

  const bx = [], by = [], br = [];
  const gx = [], gy = [], gr = [];
  const lxA = [], lyA = [], lxB = [], lyB = [];
  const counts = new Int32Array(LEVELS), gcounts = new Int32Array(LEVELS);
  const lcounts = new Int32Array(LINE_LEVELS);
  for (let i = 0; i < LEVELS; i++) {
    bx.push(new Float32Array(CAP)); by.push(new Float32Array(CAP)); br.push(new Float32Array(CAP));
    gx.push(new Float32Array(96)); gy.push(new Float32Array(96)); gr.push(new Float32Array(96));
  }
  for (let i = 0; i < LINE_LEVELS; i++) { lxA.push(new Float32Array(LINE_CAP)); lyA.push(new Float32Array(LINE_CAP)); lxB.push(new Float32Array(LINE_CAP)); lyB.push(new Float32Array(LINE_CAP)); }

  const stars = Array.from({ length: 100 }, (_, i) => {
    const z = .2 + (i % 11) / 12;
    return { x: Math.sin(i * 127.1) * .5 + .5, y: Math.cos(i * 311.7) * .5 + .5, z, r: .4 + (i % 5) * .22, level: Math.min(3, Math.floor(z * 4)) };
  });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function buildPalette() {
    const gain = state.scene === 0 ? 1 : (state.scene === 1 ? .32 : .18);
    for (let i = 0; i < LEVELS; i++) {
      const depth = (i + .5) / LEVELS, a = (.14 + .65 * depth) * gain;
      dotFill[i] = 'rgba(' + Math.round(92 + depth * 92) + ',' + Math.round(145 + depth * 85) + ',255,' + a.toFixed(3) + ')';
      glowFill[i] = 'rgba(186,232,255,' + (a * .13).toFixed(3) + ')';
    }
    for (let i = 0; i < LINE_LEVELS; i++) {
      const depth = (i + .5) / LINE_LEVELS;
      lineStroke[i] = 'rgba(91,158,255,' + ((.14 + .65 * depth) * gain * .23).toFixed(3) + ')';
    }
    const light = state.scene === 2 || state.scene === 5;
    for (let i = 0; i < 4; i++) starFill[i] = 'rgba(150,193,255,' + ((light ? .1 : .23) * ((i + .5) / 4)).toFixed(3) + ')';
  }

  function resize() {
    w = innerWidth; h = innerHeight; small = w < 761;
    dpr = Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildPalette();
    if (!state.enabled) draw(0);
  }

  function draw(dt) {
    time += dt; state.frames++; state.energy *= .91;
    state.blend += (state.scene - state.blend) * .075;
    px += (tx - px) * .055; py += (ty - py) * .055;
    ctx.clearRect(0, 0, w, h);

    const hero = state.scene === 0;
    const cx = w * (small ? .55 : .75) + px * (small ? 5 : 25), cy = h * (small ? (hero ? .70 : .63) : .48) + py * 20;
    const size = small ? Math.min(w * (hero ? .30 : .36), hero ? h * .15 : h * .23) : Math.min(w * .23, h * .38);
    const count = small ? 120 : 210, bands = small ? 6 : 9;
    const spin = time * .12 + state.blend * .24, rx = -.45 + py * .1, ry = .28 + px * .12;
    const cosX = Math.cos(rx), sinX = Math.sin(rx), cosY = Math.cos(ry), sinY = Math.sin(ry);
    const burst = 1 + state.energy * .32, scene = state.scene;
    const field = Math.min(1, state.blend * .18);

    counts.fill(0); gcounts.fill(0); lcounts.fill(0);

    // Drifting stars, batched into four fills.
    for (let b = 0; b < 4; b++) {
      ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const s = stars[i]; if (s.level !== b) continue;
        const sx = (s.x * w + time * 3 * s.z + px * 9 * s.z) % w, sy = (s.y * h + time * 2 * s.z + py * 9 * s.z) % h;
        ctx.moveTo(sx + s.r, sy); ctx.arc(sx, sy, s.r, 0, TAU);
      }
      ctx.fillStyle = starFill[b]; ctx.fill();
    }
    if (state.energy > .3) {
      ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const s = stars[i];
        const sx = (s.x * w + time * 3 * s.z + px * 9 * s.z) % w, sy = (s.y * h + time * 2 * s.z + py * 9 * s.z) % h;
        ctx.moveTo(sx, sy); ctx.lineTo(sx + (sx - w / 2) * state.energy * .05, sy + (sy - h / 2) * state.energy * .08);
      }
      ctx.strokeStyle = 'rgba(105,168,255,' + Math.min(.22, state.energy * .08).toFixed(3) + ')';
      ctx.lineWidth = 1; ctx.stroke();
    }

    // The current: project each node once, bucket by depth, then fill each bucket in a single call.
    for (let b = 0; b < bands; b++) {
      const lane = b / (bands - 1), offset = (lane - .5) * .4;
      let hasPrev = false, prevX = 0, prevY = 0;
      for (let n = 0; n < count; n++) {
        const u = n / count * TAU, phase = u + spin;
        const wave = Math.sin(phase * 3 + time * .18), radius = 1 + .12 * wave;
        const twist = offset * Math.cos(phase * 2 + time * .18);
        let x = Math.cos(phase) * (radius + twist);
        let y = Math.sin(phase) * (radius + twist) * .77;
        let z = offset * Math.sin(phase * 2 + time * .18) + .2 * Math.sin(phase * 2);
        if (scene === 3) y = y * .6 + Math.sin(phase * 4 + time) * .18;
        if (scene === 4) { y = y * .3 + Math.sin(phase * 7 + lane) * .12; z += Math.sin(phase * 3) * .15; }
        x += Math.sin(phase * 2 + time * .3) * field * .07;
        const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
        const x1 = x * cosY + z1 * sinY, z2 = -x * sinY + z1 * cosY;
        const perspective = 2.8 / (2.8 - z2);
        const sx = cx + x1 * size * perspective * burst, sy = cy + y1 * size * perspective * burst;
        const depth = clamp((z2 + .5) / 1.1, .1, 1);
        const level = clamp((depth * LEVELS) | 0, 0, LEVELS - 1);
        const c = counts[level];
        if (c < CAP) { bx[level][c] = sx; by[level][c] = sy; br[level][c] = (small ? .65 : .8) + depth * .65; counts[level] = c + 1; }

        if (hasPrev && n % 3 !== 0) {
          const ll = clamp((depth * LINE_LEVELS) | 0, 0, LINE_LEVELS - 1), lc = lcounts[ll];
          if (lc < LINE_CAP) { lxA[ll][lc] = prevX; lyA[ll][lc] = prevY; lxB[ll][lc] = sx; lyB[ll][lc] = sy; lcounts[ll] = lc + 1; }
        }
        if (n % 31 === 0 && b % 3 === 0) {
          const gc = gcounts[level];
          if (gc < 96) { gx[level][gc] = sx; gy[level][gc] = sy; gr[level][gc] = 5 + depth * 3; gcounts[level] = gc + 1; }
        }
        prevX = sx; prevY = sy; hasPrev = true;
      }
    }

    for (let level = 0; level < LINE_LEVELS; level++) {
      const n = lcounts[level]; if (!n) continue;
      const X1 = lxA[level], Y1 = lyA[level], X2 = lxB[level], Y2 = lyB[level];
      ctx.beginPath();
      for (let i = 0; i < n; i++) { ctx.moveTo(X1[i], Y1[i]); ctx.lineTo(X2[i], Y2[i]); }
      ctx.strokeStyle = lineStroke[level]; ctx.lineWidth = .55; ctx.stroke();
    }
    for (let level = 0; level < LEVELS; level++) {
      const n = counts[level]; if (!n) continue;
      const X = bx[level], Y = by[level], R = br[level];
      ctx.beginPath();
      for (let i = 0; i < n; i++) { ctx.moveTo(X[i] + R[i], Y[i]); ctx.arc(X[i], Y[i], R[i], 0, TAU); }
      ctx.fillStyle = dotFill[level]; ctx.fill();
    }
    for (let level = 0; level < LEVELS; level++) {
      const n = gcounts[level]; if (!n) continue;
      const X = gx[level], Y = gy[level], R = gr[level];
      ctx.beginPath();
      for (let i = 0; i < n; i++) { ctx.moveTo(X[i] + R[i], Y[i]); ctx.arc(X[i], Y[i], R[i], 0, TAU); }
      ctx.fillStyle = glowFill[level]; ctx.fill();
    }
    if (state.energy > .08) {
      const r = size * (.7 + (2 - state.energy) * .6);
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .68, -.35, 0, TAU);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(124,187,255,' + (state.energy * .1).toFixed(3) + ')'; ctx.stroke();
    }
  }

  function loop(now) {
    raf = 0;
    if (!state.enabled || document.hidden) return;
    const elapsed = now - last;
    if (elapsed > interval - 1) {
      const started = performance.now();
      draw(Math.min(elapsed / 1000, .05));
      last = now;
      // Pace to the machine: skip work rather than stutter when frames get expensive.
      frameCost = frameCost * .9 + (performance.now() - started) * .1;
      if (++samples % 24 === 0) interval = frameCost > 14 ? 33 : (frameCost > 9 ? 24 : 16);
    }
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && state.enabled && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function preferences() { state.enabled = !media.matches; if (!state.enabled) { cancelAnimationFrame(raf); raf = 0; state.energy = 0; draw(0); } else start(); }
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; tx = (e.clientX / w - .5) * 2; ty = (e.clientY / h - .5) * 2; }, { passive: true });
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => { document.body.classList.toggle('motion-paused', document.hidden); if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); });
  media.addEventListener('change', preferences);

  window.portfolioParticles = {
    setScene(index) {
      ghost?.remove(); ghost = null;
      if (canvas.parentElement !== scenes[index]) {
        ghost = document.createElement('canvas');
        ghost.className = 'particle-echo'; ghost.setAttribute('aria-hidden', 'true');
        ghost.width = canvas.width; ghost.height = canvas.height;
        ghost.getContext('2d').drawImage(canvas, 0, 0);
        canvas.parentElement.prepend(ghost); scenes[index].prepend(canvas);
      }
      state.scene = index; state.energy = media.matches ? 0 : 1.8;
      buildPalette();
      if (!state.enabled) draw(0);
    },
    finishTransition() { ghost?.remove(); ghost = null; },
    pulse(value = 1) { state.energy = Math.max(state.energy, value); },
    getState() { return { ...state }; }
  };
  resize(); start();
})();
