// LEARN (lesson 11): Story mode, written as plain browser code (no React) because it draws every frame.
// mountHall() builds the 3D hall with three.js; mountFlat() is the light version for weak phones;
// playStory() is the scroll-driven story player. StoryMode.tsx loads this file only when someone opens Story mode.
/* eslint-disable */

const $$ = (root, s) => root.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const split = (s) => {
  s = s || '';
  const m = s.match(/^(.+?[.!?])\s+(.*)$/);
  let r = m ? [m[1], m[2]] : [s, ''];
  if (r[0].length > 95) { const k = r[0].search(/[:,;]\s/); if (k > 20) r = [r[0].slice(0, k) + '.', (r[0].slice(k + 2).replace(/^./, (c) => c.toUpperCase()) + ' ' + r[1]).trim()]; }
  return r;
};
const blurb = (e) => [split(e.problem)[0], split(e.result)[0]].filter(Boolean).join(' ');

/** Whether this device should get the light version. */
export function weakDevice() {
  try { const c = document.createElement('canvas'); if (!(c.getContext('webgl2') || c.getContext('webgl'))) return true; } catch (e) { return true; }
  return (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ---------- shared HUD: the plaque for the exhibit you're standing at ----------
function hud(root, exhibits, onPlay, onClose) {
  root.insertAdjacentHTML('beforeend', `<div class="gblobs" aria-hidden="true"><i></i><i></i><i></i></div>
    <button class="gx" aria-label="Leave Story mode">✕</button>
    <div class="plaque" aria-live="polite"><div class="k"></div><div class="nm"></div><div class="kind"></div><p class="pw"></p>
      <div class="pact"><button class="pplay">▶ Play story</button><a class="popen">Open case study ↗</a></div></div>
    <div class="walk"><button class="gprev" aria-label="Previous case study">←</button><button class="gnext" aria-label="Next case study">→</button></div>
    <div class="ghint3">Drag or scroll to walk the hall</div>`);
  let cur = -1;
  $$(root, '.gx').onclick = onClose;
  $$(root, '.pplay').onclick = () => onPlay(cur);
  return {
    show(i) {
      cur = i; const e = exhibits[i], n = String(exhibits.length).padStart(2, '0');
      $$(root, '.k').textContent = `You are walking past · ${String(i + 1).padStart(2, '0')} / ${n}`;
      $$(root, '.nm').textContent = e.name; $$(root, '.kind').textContent = e.kind; $$(root, '.pw').textContent = blurb(e);
      $$(root, '.popen').href = e.href; root.style.setProperty('--acc', e.accent);
      const pq = $$(root, '.plaque'); pq.classList.remove('in'); void pq.offsetWidth; pq.classList.add('in');
    },
    get cur() { return cur; },
    hideHint() { const h = $$(root, '.ghint3'); if (h) h.style.opacity = 0; },
  };
}

// ---------- the 3D hall ----------
export function mountHall(root, exhibits, T, { onPlay, onClose }) {
  const W = () => root.clientWidth, H = () => root.clientHeight, mob = () => innerWidth <= 700;
  const ren = new T.WebGLRenderer({ antialias: innerWidth > 700, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.min(devicePixelRatio, mob() ? 1.5 : 1.75)); ren.setSize(W(), H());
  ren.outputEncoding = T.sRGBEncoding; ren.domElement.className = 'gcanvas'; root.prepend(ren.domElement);
  const scene = new T.Scene(), base = new T.Color('#e6f1fb');
  scene.background = base.clone(); scene.fog = new T.Fog(base.clone(), 7, 24);
  const cam = new T.PerspectiveCamera(60, W() / H(), 0.35, 90);
  const N = exhibits.length, GAP = 7.2, Ro = Math.max(11, (N * GAP) / (2 * Math.PI)), Ri = Ro - 9, rc = Ro - 6.4, eye = 1.7, AHEAD = 0.42, wallH = 8;
  const ex = exhibits.map((e, i) => ({ e, i, ang: (i * 2 * Math.PI) / N, col: new T.Color(e.accent) }));
  const ui = hud(root, exhibits, onPlay, onClose);
  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  // walls, floor, ceiling
  const mkWall = (r, h, side, top, bot) => {
    const geo = track(new T.CylinderGeometry(r, r, h, 200, 1, true)), pos = geo.attributes.position, cols = [];
    for (let i = 0; i < pos.count; i++) { const y = (pos.getY(i) + h / 2) / h; const c = new T.Color(bot).lerp(new T.Color(top), Math.pow(y, 0.7)); cols.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    const m = new T.Mesh(geo, track(new T.MeshBasicMaterial({ vertexColors: true, side }))); m.position.y = h / 2 - 0.01; scene.add(m);
  };
  mkWall(Ro, wallH, T.BackSide, '#ffffff', '#cfe2f5');
  mkWall(Ri, 2.6, T.FrontSide, '#eaf4ff', '#bcd3ec');
  const basic = (o) => track(new T.MeshBasicMaterial(o));
  const rim = new T.Mesh(track(new T.TorusGeometry(Ri, 0.06, 8, 200)), basic({ color: '#bae6fd' })); rim.rotation.x = Math.PI / 2; rim.position.y = 2.6; scene.add(rim);
  scene.add(new T.HemisphereLight('#ffffff', '#b6c8dd', 0.85)); const sun = new T.DirectionalLight('#ffffff', 0.55); sun.position.set(6, 12, 4); scene.add(sun);
  const base2 = new T.Mesh(track(new T.CylinderGeometry(Ro - 0.06, Ro - 0.06, 0.32, 200, 1, true)), basic({ color: '#b9cde3', side: T.BackSide })); base2.position.y = 0.16; scene.add(base2);
  const pm = track(new T.MeshLambertMaterial({ color: '#ffffff', emissive: '#d9e6f3' }));
  const pil = track(new T.BoxGeometry(0.5, wallH, 0.5)), cap = track(new T.BoxGeometry(0.8, 0.24, 0.8)), post = track(new T.BoxGeometry(0.25, 2.6, 0.25));
  for (let k = 0; k < N; k++) {
    const a = ((k + 0.5) * 2 * Math.PI) / N, m = new T.Mesh(pil, pm); m.position.set(Math.cos(a) * (Ro - 0.2), wallH / 2, Math.sin(a) * (Ro - 0.2)); m.lookAt(0, wallH / 2, 0); scene.add(m);
    [0.12, wallH - 0.12].forEach((y) => { const c = new T.Mesh(cap, pm); c.position.set(Math.cos(a) * (Ro - 0.25), y, Math.sin(a) * (Ro - 0.25)); c.lookAt(0, y, 0); scene.add(c); });
  }
  for (let k = 0; k < N * 2; k++) { const a = ((k + 0.25) * Math.PI) / N, m = new T.Mesh(post, pm); m.position.set(Math.cos(a) * (Ri + 0.08), 1.3, Math.sin(a) * (Ri + 0.08)); scene.add(m); }
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); const t = track(new T.CanvasTexture(c)); t.encoding = T.sRGBEncoding; return t; };
  const ftx = canvasTex(256, 256, (x) => { x.fillStyle = '#e8eef6'; x.fillRect(0, 0, 256, 256); x.strokeStyle = 'rgba(100,130,170,.18)'; x.lineWidth = 3; x.strokeRect(0, 0, 256, 256); });
  ftx.wrapS = ftx.wrapT = T.RepeatWrapping; ftx.repeat.set(Ro * 1.1, Ro * 1.1); ftx.anisotropy = 8;
  const floor = new T.Mesh(track(new T.CircleGeometry(Ro + 0.1, 200)), basic({ map: ftx })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const path = new T.Mesh(track(new T.RingGeometry(rc - 0.05, rc + 0.05, 240, 1)), basic({ color: '#93c5fd', transparent: true, opacity: 0.55, depthWrite: false })); path.rotation.x = -Math.PI / 2; path.position.y = 0.03; path.renderOrder = 1; scene.add(path);
  const ceil = new T.Mesh(track(new T.CircleGeometry(Ro + 0.2, 160)), basic({ color: '#f3f8fd', side: T.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = wallH; scene.add(ceil);
  const sl = new T.Mesh(track(new T.RingGeometry(Ri + 1, Ro - 1.2, 160, 1)), basic({ color: '#ffffff', side: T.DoubleSide })); sl.rotation.x = Math.PI / 2; sl.position.y = wallH - 0.06; scene.add(sl);
  const lampG = track(new T.CircleGeometry(0.45, 32)), lampM = basic({ color: '#ffffff' });
  for (let k = 0; k < N * 2; k++) { const a = ((k + 0.5) * Math.PI) / N, l = new T.Mesh(lampG, lampM); l.rotation.x = Math.PI / 2; l.position.set(Math.cos(a) * (rc + 1.5), wallH - 0.12, Math.sin(a) * (rc + 1.5)); scene.add(l); }
  // benches along the walkway
  const benchM = track(new T.MeshLambertMaterial({ color: '#ffffff', emissive: '#cfdcea' })), seatM = track(new T.MeshLambertMaterial({ color: '#e2ecf6', emissive: '#9fb4cc' }));
  const seatG = track(new T.BoxGeometry(2.4, 0.12, 0.7)), legG = track(new T.BoxGeometry(0.12, 0.45, 0.6));
  for (let k = 0; k < N; k++) {
    const a = ((k + 0.5) * 2 * Math.PI) / N, b = new T.Group(), seat = new T.Mesh(seatG, seatM); seat.position.y = 0.48; b.add(seat);
    [-1, 1].forEach((sd) => { const leg = new T.Mesh(legG, benchM); leg.position.set(sd * 1.05, 0.22, 0); b.add(leg); });
    b.position.set(Math.cos(a) * (Ri + 2.2), 0, Math.sin(a) * (Ri + 2.2)); b.lookAt(0, 0, 0); b.rotateY(Math.PI / 2); scene.add(b);
  }
  const radial = (inner, outer) => canvasTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, inner); g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.45)')); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  const glowTex = radial('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), shadowTex = radial('rgba(30,50,80,.35)', 'rgba(30,50,80,0)');

  // exhibits: an arch per case study, built once its image has loaded (so the arch fits the image)
  const arch = (w, h) => { const s = new T.Shape(), r = w / 2; s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.lineTo(-r, 0); return track(new T.ShapeGeometry(s, 32)); };
  const plate = (n, name) => canvasTex(512, 96, (x) => { x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.roundRect ? x.roundRect(4, 4, 504, 88, 44) : x.rect(4, 4, 504, 88); x.fill(); x.fillStyle = '#0284c7'; x.font = '800 30px "Plus Jakarta Sans",system-ui,sans-serif'; x.textAlign = 'center'; x.fillText(String(n).padStart(2, '0') + '  ·  ' + name.slice(0, 24), 256, 60); });
  const loader = new T.TextureLoader(), arts = [], halos = [], pools = [], glows = [];
  ex.forEach((x) => {
    const pool = new T.Mesh(track(new T.CircleGeometry(2.6, 48)), basic({ color: x.col, transparent: true, opacity: 0.12, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(Math.cos(x.ang) * (Ro - 2.2), 0.06, Math.sin(x.ang) * (Ro - 2.2)); pool.renderOrder = 2; scene.add(pool); pools[x.i] = pool;
    loader.load(x.e.screens[0].src, (tex) => {
      track(tex); tex.encoding = T.sRGBEncoding; tex.anisotropy = ren.capabilities.getMaxAnisotropy();
      const r = tex.image.width / tex.image.height, web = r >= 0.9, ah = web ? 2.9 : 3.6, aw = web ? Math.min(4.8, ah * r) : ah * r, h = web ? aw / r : ah;
      const g = new T.Group(), nw = aw + 1.3, nh = h + 2.3, y0 = 1.05, at = (m, X, Y, Z) => { m.position.set(X, Y, Z); g.add(m); return m; };
      const gl = at(new T.Mesh(track(new T.PlaneGeometry(nw * 2.6, nh * 1.7)), basic({ map: glowTex, color: x.col, transparent: true, opacity: 0.22, depthWrite: false, fog: false })), 0, nh * 0.5, -0.16); gl.renderOrder = 1; glows[x.i] = gl;
      const halo = at(new T.Mesh(arch(nw + 1, nh + 0.8), basic({ color: x.col, transparent: true, opacity: 0.15, depthWrite: false })), 0, -0.01, -0.1); halo.renderOrder = 2; halos[x.i] = halo;
      at(new T.Mesh(arch(nw, nh), basic({ color: new T.Color('#ffffff').lerp(x.col, 0.35) })), 0, 0, -0.07);
      at(new T.Mesh(arch(nw - 0.45, nh - 0.3), basic({ color: new T.Color('#ffffff').lerp(x.col, 0.1) })), 0, 0, -0.045);
      at(new T.Mesh(track(new T.PlaneGeometry(aw + 0.14, h + 0.14)), basic({ color: '#ffffff' })), 0, y0 + h / 2, -0.02);
      const art = at(new T.Mesh(track(new T.PlaneGeometry(aw, h)), basic({ map: tex })), 0, y0 + h / 2, 0); art.userData.i = x.i; arts.push(art);
      at(new T.Mesh(track(new T.PlaneGeometry(2.9, 0.54)), basic({ map: plate(x.i + 1, x.e.name), transparent: true })), 0, 0.5, 0.02);
      g.position.set(Math.cos(x.ang) * (Ro - 0.3), 0, Math.sin(x.ang) * (Ro - 0.3)); g.lookAt(0, 0, 0); scene.add(g);
      const sh = new T.Mesh(track(new T.PlaneGeometry(nw + 1.6, 2.2)), basic({ map: shadowTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.rotation.z = -x.ang + Math.PI / 2; sh.position.set(Math.cos(x.ang) * (Ro - 0.9), 0.09, Math.sin(x.ang) * (Ro - 0.9)); sh.renderOrder = 3; scene.add(sh);
      need();
    });
  });

  // walking
  let phi = ex[0].ang - AHEAD, vel = 0, target = null, drag = false, lx = 0, moved = 0, raf = 0, idle = 0, bob = 0, alive = true;
  const curCol = new T.Color(exhibits[0].accent), tmp = new T.Color();
  const wrapTo = (a) => { while (a - phi > Math.PI) a -= 2 * Math.PI; while (a - phi < -Math.PI) a += 2 * Math.PI; return a; };
  const nearest = () => { let best = 1e9, bi = 0; ex.forEach((x) => { const d = Math.abs(wrapTo(x.ang - AHEAD) - phi); if (d < best) { best = d; bi = x.i; } }); return bi; };
  const fov = () => { const ar = W() / H(); cam.aspect = ar; cam.fov = ar < 1 ? Math.min(80, 62 / Math.sqrt(ar)) : 58; cam.updateProjectionMatrix(); };
  const ease = (arr, k, want) => { const m = arr[k]; if (!m) return false; m.material.opacity += (want - m.material.opacity) * 0.15; return Math.abs(want - m.material.opacity) > 0.01; };
  function frame() {
    if (!alive) return;
    let moving = false;
    if (target !== null) { const d = target - phi; phi += d * 0.075; bob += Math.min(0.25, Math.abs(d) * 2.5); moving = true; if (Math.abs(d) < 0.0006) { phi = target; target = null; } }
    else if (!drag && Math.abs(vel) > 0.00008) { phi += vel; vel *= 0.9; bob += Math.min(0.25, Math.abs(vel) * 60); moving = true; }
    else if (!drag) { idle++; if (idle === 8) { target = wrapTo(ex[nearest()].ang - AHEAD); } }
    const i = nearest(); if (i !== ui.cur) ui.show(i);
    tmp.set(exhibits[ui.cur].accent);
    if (!curCol.equals(tmp)) { curCol.lerp(tmp, 0.07); moving = true; if (Math.abs(curCol.r - tmp.r) + Math.abs(curCol.g - tmp.g) + Math.abs(curCol.b - tmp.b) < 0.01) curCol.copy(tmp); }
    scene.background.copy(base).lerp(curCol, 0.09); scene.fog.color.copy(scene.background);
    for (let k = 0; k < N; k++) { const on = k === ui.cur; if (ease(halos, k, on ? 0.45 : 0.15) | ease(glows, k, on ? 0.55 : 0.22) | ease(pools, k, on ? 0.22 : 0.07)) moving = true; }
    cam.position.set(Math.cos(phi) * rc, eye + Math.abs(Math.sin(bob)) * 0.03, Math.sin(phi) * rc);
    const a = phi + AHEAD; cam.lookAt(Math.cos(a) * Ro, 2.15 + Math.sin(bob) * 0.025, Math.sin(a) * Ro);
    ren.render(scene, cam);
    raf = moving || drag || target !== null || idle < 10 ? requestAnimationFrame(frame) : 0;
  }
  function need() { idle = 0; if (!raf && alive) raf = requestAnimationFrame(frame); }
  const walkTo = (i) => { target = wrapTo(ex[(i + N) % N].ang - AHEAD); vel = 0; need(); };
  const ray = new T.Raycaster(), mv = new T.Vector2(), cv = ren.domElement;
  const pick = (cx, cy) => { const r = cv.getBoundingClientRect(); mv.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(mv, cam); const h = ray.intersectObjects(arts)[0]; return h ? h.object.userData.i : null; };
  cv.onpointerdown = (e) => { drag = true; moved = 0; lx = e.clientX; vel = 0; target = null; cv.setPointerCapture(e.pointerId); root.classList.add('drag'); need(); };
  cv.onpointermove = (e) => { if (!drag) { cv.style.cursor = pick(e.clientX, e.clientY) !== null ? 'pointer' : 'grab'; return; } const dx = e.clientX - lx; lx = e.clientX; const d = -dx * (mob() ? 0.0035 : 0.0022); phi += d; vel = d; moved += Math.abs(dx); ui.hideHint(); need(); };
  cv.onpointerup = (e) => { drag = false; root.classList.remove('drag'); if (moved < 6) { const i = pick(e.clientX, e.clientY); if (i !== null) walkTo(i); } need(); };
  cv.onpointercancel = () => { drag = false; root.classList.remove('drag'); need(); };
  const onWheel = (e) => { if (e.target.closest('.plaque')) return; e.preventDefault(); target = null; vel = Math.max(-0.02, Math.min(0.02, vel + (e.deltaY + e.deltaX) * 0.00018)); ui.hideHint(); need(); };
  root.addEventListener('wheel', onWheel, { passive: false });
  $$(root, '.gprev').onclick = () => walkTo(ui.cur - 1); $$(root, '.gnext').onclick = () => walkTo(ui.cur + 1);
  const onKey = (e) => { if (root.querySelector('.nk-story-player')) return; if (e.key === 'ArrowRight' || e.key === 'ArrowUp') walkTo(ui.cur + 1); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') walkTo(ui.cur - 1); if (e.key === 'Enter') onPlay(ui.cur); if (e.key === 'Escape') onClose(); };
  addEventListener('keydown', onKey);
  const ro = new ResizeObserver(() => { ren.setSize(W(), H()); fov(); need(); }); ro.observe(root);
  fov(); need();
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', onKey); root.removeEventListener('wheel', onWheel); disposables.forEach((d) => d.dispose && d.dispose()); ren.dispose(); ren.domElement.remove(); };
}

// ---------- the light version: same plaque and walking, one big arch, no 3D ----------
export function mountFlat(root, exhibits, { onPlay, onClose }) {
  root.classList.add('flat');
  root.insertAdjacentHTML('afterbegin', '<div class="flatstage"><div class="farch"><img alt=""></div></div>');
  const ui = hud(root, exhibits, onPlay, onClose), img = $$(root, '.farch img');
  const go = (i) => { i = (i + exhibits.length) % exhibits.length; ui.show(i); img.style.opacity = 0; setTimeout(() => { img.src = exhibits[i].screens[0].src; img.alt = exhibits[i].name; img.onload = () => (img.style.opacity = 1); }, 180); };
  $$(root, '.gprev').onclick = () => go(ui.cur - 1); $$(root, '.gnext').onclick = () => go(ui.cur + 1);
  let sx = 0; root.onpointerdown = (e) => (sx = e.clientX); root.onpointerup = (e) => { const d = e.clientX - sx; if (Math.abs(d) > 50) go(ui.cur + (d < 0 ? 1 : -1)); };
  const onKey = (e) => { if (root.querySelector('.nk-story-player')) return; if (e.key === 'ArrowRight') go(ui.cur + 1); if (e.key === 'ArrowLeft') go(ui.cur - 1); if (e.key === 'Escape') onClose(); };
  addEventListener('keydown', onKey); $$(root, '.ghint3').textContent = 'Swipe or use the arrows'; go(0);
  return () => removeEventListener('keydown', onKey);
}

// ---------- stories ----------
const HB = '/assets/';
const HEATBUD = [
  { k: 'The spark', h: 'El Niño was on the news. I was too busy to notice the heat.', b: 'I’d look up in the afternoon with a headache, realise I’d barely had water, and only then notice how hot it was. Weather apps gave me a number. None of them told me what to do with it.', src: HB + 'hb-home.webp' },
  { k: 'Who it’s for', h: 'Built for me first, shaped for anyone out in the sun.', b: 'I work indoors. Millions of Nigerians spend their whole day outside.', x: '<div class="chips"><span>Busy people indoors</span><span>Riders &amp; traders</span><span>Students</span><span>Families</span></div>', src: HB + 'hb-home.webp' },
  { k: 'The idea', h: 'A weather number is data. HeatBud turns it into a decision.', b: 'Feels-like temperature, the safest hour to go out and a water plan, in one plain sentence.', x: '<div class="compare"><div class="from">34°C, 70% humidity</div><div class="to">Feels like 41°. Go out before 10am.</div></div>', src: HB + 'hb-home.webp' },
  { k: 'The app', h: 'Five tabs, one job: get you through the day safely.', b: 'Home, Forecast, Water, Alerts and Me. Plan around the heat, not into it.', src: HB + 'hb-forecast.jpg' },
  { k: 'The struggle', h: 'What was harder than it looked.', b: 'My first water screen filled the page like a glass. Fun, but it buried everything. Push alerts broke when I dragged files onto Netlify, so I learned to deploy from the command line and added calendar alarms as a backup.', src: HB + 'hb-alerts.webp' },
  { k: 'The result', h: 'Live, installable and in my pocket.', b: 'Designed, built and shipped by me. My first real step from product designer to design engineer.', x: '<div class="stats"><div class="stat"><b data-n="5">0</b><span>tabs</span></div><div class="stat"><b data-n="7">0</b><span>days of forecast</span></div><div class="stat"><b data-n="12">0</b><span>buddies</span></div><div class="stat"><b data-n="3">0</b><span>ways to be reminded</span></div></div>', src: HB + 'hb-water.webp' },
  { k: 'What’s next', h: 'Reliable alerts on every phone, and an Abuja that looks like home.', b: 'This story updates as the app does.', x: '<a class="cta" href="/work/heatbud">Open the case study →</a>', src: HB + 'hb-home.webp' },
];

export function storyFor(e) {
  const S = e.screens, src = (n) => S[Math.min(S.length - 1, n)].src;
  if (e.handmade) return { name: e.name, mask: 'HEAT<br>BUD', cover: '/assets/hb-cover.webp', wings: [HB + 'hb-forecast.jpg', HB + 'hb-water.webp'], wingAt: 3, CH: HEATBUD };
  const CH = [], add = (k, txt, n, x) => { if (!txt) return; const [h, b] = split(txt); CH.push({ k, h, b, src: src(n), x }); };
  add('The problem', e.problem || e.kind, 0); add('What I did', e.did, 1);
  CH.push({ k: 'The work', h: `${S.length} screen${S.length > 1 ? 's' : ''}, one flow.`, b: S.map((s) => s.t).join(' → '), src: src(0) });
  add('The result', e.result, S.length - 1); add('The trade-off', e.trade, 2);
  CH.push({ k: 'Want the full story?', h: e.name, b: e.kind, src: src(0), x: `<a class="cta" href="${esc(e.href)}">Open the case study →</a>` });
  const words = e.name.split(' ').slice(0, 2);
  return { name: e.name, mask: esc(words.join(' ').toUpperCase()).replace(' ', '<br>'), cover: src(0), wings: S.length > 2 ? [src(1), src(2)] : [], wingAt: 2, CH };
}

/** The scroll-driven story player. Returns a function that closes it. */
export function playStory(host, sc, onDone) {
  const st = document.createElement('div'); st.className = 'nk-story-player'; st.setAttribute('role', 'dialog'); st.setAttribute('aria-label', `${sc.name} story`);
  const CH = sc.CH, N = CH.length, SCR = CH.map((c) => c.src), uniq = [...new Set(SCR)];
  st.innerHTML = `<button class="x sx" aria-label="Close story">✕</button><div class="track" style="height:${(N + 1) * 100}vh"><div class="pin">${CH.map((c) => `<div class="bgl" style="background-image:url('${c.src}')"></div>`).join('')}
    <div class="mask"><b style="background-image:url('${sc.cover}');font-size:${sc.mask.length > 12 ? 'min(13vw,170px)' : 'min(24vw,280px)'}">${sc.mask}</b><small>Scroll to begin</small></div>
    <div class="wing wl"><div class="phone"><img src="${sc.wings[0] || ''}" alt=""></div></div><div class="wing wr"><div class="phone"><img src="${sc.wings[1] || ''}" alt=""></div></div>
    <div class="hero"><div class="phone">${uniq.map((k, n) => `<img data-k="${n}" src="${k}" alt="" style="opacity:${n === 0 ? 1 : 0}">`).join('')}</div></div>
    ${CH.map((c) => `<div class="tx"><div class="kicker">${esc(c.k)}</div><h2 class="big">${esc(c.h)}</h2>${c.b ? `<p class="body">${esc(c.b)}</p>` : ''}${c.x || ''}</div>`).join('')}
    <div class="prog"></div><div class="hud"><button class="pv" aria-label="Previous chapter">←</button><span class="ct">1 / ${N}</span><button class="nx" aria-label="Next chapter">→</button></div></div></div>`;
  host.appendChild(st);
  const q = (s) => st.querySelector(s), bgs = [...st.querySelectorAll('.bgl')], txs = [...st.querySelectorAll('.tx')], hero = q('.hero'), wl = q('.wl'), wr = q('.wr'), mask = q('.mask b'), hint = q('.mask small'), imgs = [...hero.querySelectorAll('img')];
  // the phone frame takes the shape of the screens (tall for apps, wide for websites and dashboards)
  const probe = new Image(); probe.onload = () => { const r = probe.width / probe.height; if (r >= 0.9) { st.classList.add('web'); hero.style.setProperty('--r', r); } render(); }; probe.src = uniq[0];
  const mob = () => innerWidth <= 700;
  const KM = [[0, 30, 0.6, 0, 0], [0, 22, 0.9, -6, 1], [0, 22, 1, 0, 1], [0, 22, 1, 0, 1], [0, 24, 1, 4, 1], [0, 40, 0.7, 0, 0.15], [0, 22, 1, 0, 1]];
  const KD = [[20, 10, 0.6, 0, 0], [22, 0, 0.9, -8, 1], [24, 0, 1, 0, 1], [22, 0, 1, 0, 1], [24, 2, 1, 6, 1], [30, 0, 0.75, 0, 0.2], [22, 0, 1, -4, 1]];
  const K = () => Array.from({ length: N }, (_, n) => (mob() ? KM : KD)[Math.min(6, n)]);
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), lerp = (a, b, u) => a + (b - a) * u;
  function render() {
    const vh = st.clientHeight, p = Math.max(0, st.scrollTop / vh), intro = Math.min(1, p);
    mask.style.transform = `scale(${1 + intro * 6})`; mask.style.opacity = Math.max(0, 1 - intro * 1.4); hint.style.opacity = Math.max(0, 1 - intro * 4);
    const c = Math.max(0, p - 1), i = Math.min(N - 1, Math.floor(c)), u = ease(Math.min(1, Math.max(0, (c - i - 0.55) / 0.45))), j = Math.min(N - 1, i + 1);
    bgs.forEach((b, k) => { b.style.opacity = k === i ? (1 - u) * Math.min(1, intro * 1.2) : k === j && j !== i ? u : 0; b.style.transform = `scale(${1.1 + (c - k + 1) * 0.04})`; });
    txs.forEach((t, k) => { const dd = c - k, o = Math.max(0, 1 - Math.abs(dd - 0.25) * 2.2) * Math.max(0, Math.min(1, (intro - 0.75) / 0.25)); t.style.opacity = o; t.style.pointerEvents = o > 0.5 ? 'auto' : 'none'; const y = dd * -60; t.style.transform = mob() ? `translateY(${y}px)` : `translateY(calc(-50% + ${y}px))`;
      t.querySelectorAll('[data-n]').forEach((el) => { const rr = Math.min(1, Math.max(0, (c - k + 0.25) / 0.35)); el.textContent = Math.round(+el.dataset.n * rr); }); });
    const ks = K(), a = ks[i], b = ks[j], h = a.map((v, n) => lerp(v, b[n], u));
    hero.style.transform = `translate(${h[0]}vw,${h[1]}vh) scale(${h[2]}) rotate(${h[3]}deg)`; hero.style.opacity = intro < 1 ? h[4] * intro : h[4];
    const showK = String(uniq.indexOf(u > 0.5 ? SCR[j] : SCR[i])); imgs.forEach((im) => (im.style.opacity = im.dataset.k === showK ? 1 : 0));
    const w = sc.wings.length ? Math.max(0, 1 - Math.abs(c - (sc.wingAt + 0.25)) * 1.6) : 0, sx = mob() ? 28 : 15;
    wl.style.opacity = wr.style.opacity = w; wl.style.transform = `translate(${h[0] - sx * w}vw,${h[1] + 4}vh) rotate(${-10 * w}deg) scale(${0.8 + 0.2 * w})`; wr.style.transform = `translate(${h[0] + sx * w}vw,${h[1] + 4}vh) rotate(${10 * w}deg) scale(${0.8 + 0.2 * w})`;
    q('.prog').style.width = (st.scrollTop / (st.scrollHeight - st.clientHeight)) * 100 + '%';
    q('.ct').textContent = `${Math.round(Math.min(N - 1, c)) + 1} / ${N}`;
  }
  let ticking = false;
  st.onscroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(); }); } };
  const jump = (k) => st.scrollTo({ top: (Math.max(0, Math.min(N - 1, k)) + 1.15) * st.clientHeight, behavior: 'smooth' });
  const go = (d) => { const c = Math.max(0, st.scrollTop / st.clientHeight - 1); if (st.scrollTop < st.clientHeight * 0.9 && d > 0) return jump(0); jump(Math.round(c) + d); };
  q('.pv').onclick = () => go(-1); q('.nx').onclick = () => go(1);
  const close = () => { removeEventListener('keydown', onKey, true); removeEventListener('resize', render); st.remove(); onDone && onDone(); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1); if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1); };
  q('.sx').onclick = close; addEventListener('keydown', onKey, true); addEventListener('resize', render);
  render(); st.focus?.();
  return close;
}
