import { useEffect, useRef } from 'react';
import { lerp, reduceMotion, useFrame } from './hooks.js';

// ---------- miasto w tle hero ----------
// Warstwy od najdalszej: niebo, daleka panorama, srodek, hologram na niebie, bliskie budynki,
// wielkie wiezowce na pierwszym planie (z hologramami reklam), a na wierzchu deszcz i latajace auta.
// Budynki rysujemy raz na canvasie; wszystko, co sie rusza, to CSS albo jeden animowany canvas.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rnd, arr) => arr[(rnd() * arr.length) | 0];

const WARM = ['#ffd27a', '#ffe2a6', '#ffc46b', '#fff0cc', '#ffb357'];
const COOL = ['#dcecff', '#c4e2ff', '#eef6ff', '#b8f0ff'];
const NEON = ['#ff2a6d', '#00f0ff', '#fcee0a', '#ff4fd8', '#7dff9a'];
const SIGNS = ['ラーメン', '電脳', 'ネオン', 'ホテル', '寿司', 'バー', 'カラオケ', '薬'];
const BOARDS = ['24H', 'BAR', 'HOTEL', 'NOODLES', 'CLUB', 'RAMEN', 'ネオン', '電脳'];
const JP = '"Yu Gothic", "Meiryo", "Hiragino Sans", "Noto Sans JP", sans-serif';

function layerCanvas(c, w, h, dpr) {
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // swiatla rysujemy osobno, zeby na koncu dodac im poswiate (bloom)
  const lc = document.createElement('canvas');
  lc.width = c.width;
  lc.height = c.height;
  const l = lc.getContext('2d');
  l.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, l, lc };
}

// okna na scianie: pietrami, cieple lub zimne, czasem cale pietro biura, co kilkanascie pieter pas swiatla
function facade(l, rnd, x, y, w, h, o, k = 1) {
  const fh = o.floor;
  const cw = o.col * k;
  const ww = cw * 0.56;
  const wh = fh * 0.56;
  const warm = rnd();
  const stripCol = pick(rnd, ['#00f0ff', '#ff2a6d', '#fcee0a']);
  let f = 0;
  for (let fy = y + fh * 0.8; fy < y + h - fh * 0.4; fy += fh, f++) {
    if (o.strip && f % o.strip === o.strip - 1) {
      l.globalAlpha = 0.4 * k;
      l.fillStyle = stripCol;
      l.fillRect(x, fy + fh * 0.25, w, 1.3);
      continue;
    }
    const r = rnd();
    const fl = r < 0.06 ? 0.9 : r < 0.32 ? o.lit * 0.12 : o.lit * (0.45 + rnd());
    const tone = rnd() < warm ? WARM : COOL;
    for (let wx = x + cw * 0.45; wx + ww < x + w - cw * 0.25; wx += cw) {
      if (o.glass) {
        l.globalAlpha = o.glass * k;
        l.fillStyle = '#8fa6d6';
        l.fillRect(wx, fy, ww, wh);
      }
      if (rnd() < fl) {
        l.globalAlpha = o.glow * k * (0.45 + rnd() * 0.55);
        l.fillStyle = rnd() < 0.08 ? pick(rnd, tone === WARM ? COOL : WARM) : pick(rnd, tone);
        l.fillRect(wx, fy, ww, wh);
      }
    }
  }
  l.globalAlpha = 1;
}

function beacon(l, x, y, r) {
  l.fillStyle = '#ff3b2f';
  l.beginPath();
  l.arc(x, y, r, 0, Math.PI * 2);
  l.fill();
}

function neonSign(l, rnd, x, y, h) {
  const col = pick(rnd, NEON);
  const txt = pick(rnd, SIGNS);
  const w = Math.max(14, h / (txt.length + 0.6));
  l.fillStyle = 'rgba(10,6,18,.9)';
  l.fillRect(x, y, w, h);
  l.strokeStyle = col;
  l.lineWidth = 1.5;
  l.shadowColor = col;
  l.shadowBlur = 10;
  l.strokeRect(x + 1, y + 1, w - 2, h - 2);
  l.fillStyle = col;
  l.font = `700 ${Math.round(w * 0.68)}px ${JP}`;
  l.textAlign = 'center';
  l.textBaseline = 'middle';
  const step = (h - w * 0.3) / txt.length;
  [...txt].forEach((ch, i) => l.fillText(ch, x + w / 2, y + w * 0.15 + step * (i + 0.5)));
  l.shadowBlur = 0;
}

function board(l, rnd, x, y, w, h) {
  const a = pick(rnd, NEON);
  const b = pick(rnd, ['#3a0ca3', '#7209b7', '#0b3d91', '#1a0b2e']);
  const gr = l.createLinearGradient(x, y, x + w, y + h);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  l.globalAlpha = 0.85;
  l.fillStyle = gr;
  l.fillRect(x, y, w, h);
  l.globalAlpha = 1;
  l.fillStyle = 'rgba(255,255,255,.92)';
  l.font = `800 ${Math.round(h * 0.42)}px "Chakra Petch", ${JP}`;
  l.textAlign = 'center';
  l.textBaseline = 'middle';
  l.fillText(pick(rnd, BOARDS), x + w / 2, y + h / 2, w * 0.86);
  l.fillStyle = 'rgba(0,0,0,.18)';
  for (let sy = y; sy < y + h; sy += 3) l.fillRect(x, sy, w, 1);
}

// jeden budynek: front, sciana boczna w perspektywie, okna, korona dachu, szyldy
function building(g, l, rnd, b, o, H, cx) {
  const top = b.y;
  // sciana boczna od strony srodka kadru
  const sw = o.side ? b.w * o.side : 0;
  if (sw) {
    const right = b.x + b.w / 2 < cx;
    const sx = right ? b.x + b.w : b.x - sw;
    const drop = sw * 0.35;
    g.fillStyle = o.sideBody;
    g.beginPath();
    if (right) {
      g.moveTo(sx, top);
      g.lineTo(sx + sw, top + drop);
      g.lineTo(sx + sw, H);
      g.lineTo(sx, H);
    } else {
      g.moveTo(sx + sw, top);
      g.lineTo(sx, top + drop);
      g.lineTo(sx, H);
      g.lineTo(sx + sw, H);
    }
    g.fill();
    facade(l, rnd, sx, top + drop, sw, H - top - drop, o, 0.55);
  }
  g.fillStyle = o.body;
  g.fillRect(b.x, top, b.w, H - top + 2);
  facade(l, rnd, b.x, top, b.w, H - top, o);
  if (o.rim) {
    l.globalAlpha = 0.5;
    l.fillStyle = o.rim;
    l.fillRect(b.x, top, b.w, 1);
    l.globalAlpha = 1;
  }
  // korona: uskok i antena ze swiatlem
  if (b.tall) {
    const cw = b.w * (0.45 + rnd() * 0.3);
    const ch = (H - top) * (0.04 + rnd() * 0.05);
    const cx0 = b.x + (b.w - cw) / 2;
    g.fillStyle = o.body;
    g.fillRect(cx0, top - ch, cw, ch + 1);
    const ah = 10 + rnd() * 40 * o.scale;
    g.fillRect(cx0 + cw / 2 - 0.8, top - ch - ah, 1.6, ah);
    beacon(l, cx0 + cw / 2, top - ch - ah, 1.4 * o.scale);
  } else if (rnd() < 0.5) {
    g.fillStyle = o.body;
    const n = 1 + ((rnd() * 2) | 0);
    for (let i = 0; i < n; i++) g.fillRect(b.x + rnd() * b.w * 0.6, top - 3 - rnd() * 6 * o.scale, b.w * (0.12 + rnd() * 0.2), 10);
  }
  // szyldy neonowe i ekrany reklamowe
  if (o.signs && H - top > H * 0.3) {
    if (rnd() < o.signs) neonSign(l, rnd, rnd() < 0.5 ? b.x + 3 : b.x + b.w - 20, top + (H - top) * (0.2 + rnd() * 0.25), 60 + rnd() * 70);
    if (rnd() < o.boards) {
      const bw = Math.min(b.w * 0.7, 70 + rnd() * 70);
      board(l, rnd, b.x + (b.w - bw) / 2, top + (H - top) * (0.12 + rnd() * 0.3), bw, bw * (0.45 + rnd() * 0.2));
    }
  }
}

function finish(g, l, lc, w, h, o) {
  // swiatla + poswiata (bloom), potem mgla i luna ulicy tylko na tym, co narysowane
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(lc, 0, 0);
  if (o.bloom) {
    g.globalCompositeOperation = 'lighter';
    g.filter = `blur(${o.bloomR}px)`;
    g.globalAlpha = o.bloom;
    g.drawImage(lc, 0, 0);
    g.filter = 'none';
    g.globalAlpha = 1;
  }
  g.restore();
  g.globalCompositeOperation = 'source-atop';
  const hz = g.createLinearGradient(0, h, 0, h * (1 - o.hazeH));
  hz.addColorStop(0, o.haze);
  hz.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hz;
  g.fillRect(0, 0, w, h);
  if (o.fog) {
    g.fillStyle = o.fog;
    g.fillRect(0, 0, w, h);
  }
  g.globalCompositeOperation = 'source-over';
}

function drawRow(c, o, w, h, dpr) {
  const { g, l, lc } = layerCanvas(c, w, h, dpr);
  const rnd = rng(o.seed);
  const body = g.createLinearGradient(0, h * 0.2, 0, h);
  body.addColorStop(0, o.top);
  body.addColorStop(1, o.bottom);
  const side = g.createLinearGradient(0, h * 0.2, 0, h);
  side.addColorStop(0, o.sideTop || o.top);
  side.addColorStop(1, o.sideBottom || o.bottom);
  const oo = { ...o, body, sideBody: side };
  let x = -10;
  while (x < w + 10) {
    const bw = w * (o.minW + rnd() * (o.maxW - o.minW));
    const tall = rnd() < o.tall;
    let bh = h * (o.minH + rnd() * (o.maxH - o.minH));
    if (tall) bh *= 1.25 + rnd() * 0.3;
    bh = Math.min(bh, h * 0.92);
    const sw = o.side ? bw * o.side : 0;
    const bx = x + (x + bw / 2 > w / 2 ? sw : 0);
    building(g, l, rnd, { x: bx, y: h - bh, w: bw, tall }, oo, h, w / 2);
    x = bx + bw + (x + bw / 2 > w / 2 ? 0 : sw) + rnd() * o.gap * w;
  }
  finish(g, l, lc, w, h, o);
}

function drawFront(c, o, w, h, dpr, blocks) {
  const { g, l, lc } = layerCanvas(c, w, h, dpr);
  const rnd = rng(o.seed);
  const body = g.createLinearGradient(0, 0, 0, h);
  body.addColorStop(0, o.top);
  body.addColorStop(1, o.bottom);
  const side = g.createLinearGradient(0, 0, 0, h);
  side.addColorStop(0, o.sideTop);
  side.addColorStop(1, o.sideBottom);
  const oo = { ...o, body, sideBody: side };
  blocks.forEach((b) => {
    const bx = b.x * w;
    const bw = b.w * w;
    const top = b.top * h;
    building(g, l, rnd, { x: bx, y: top, w: bw, tall: b.top > 0.05 }, oo, h, w * 0.42);
    // pionowe pasy LED na krawedziach
    l.globalAlpha = 0.9;
    l.fillStyle = b.led;
    l.fillRect(bx, top, 2, h - top);
    l.fillRect(bx + bw - 2, top, 2, h - top);
    l.globalAlpha = 1;
  });
  finish(g, l, lc, w, h, o);
}

// niebo: gradient, chmury podswietlone od dolu przez miasto, kilka gwiazd
function drawSky(c, w, h, dpr) {
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#04050d');
  bg.addColorStop(0.35, '#0c0b1f');
  bg.addColorStop(0.6, '#22122f');
  bg.addColorStop(0.8, '#4a1d3a');
  bg.addColorStop(1, '#8a3a3a');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const rnd = rng(5);
  for (let i = 0; i < 70; i++) {
    g.globalAlpha = 0.7;
    g.fillStyle = '#fff';
    g.fillRect(rnd() * w, rnd() * h * 0.35, rnd() < 0.2 ? 1.4 : 0.8, rnd() < 0.2 ? 1.4 : 0.8);
  }
  for (let i = 0; i < 90; i++) {
    const cx = rnd() * w;
    const cy = h * (0.08 + rnd() * 0.5);
    const rx = w * (0.06 + rnd() * 0.16);
    const ry = rx * (0.18 + rnd() * 0.12);
    const lit = cy / h;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rx);
    gr.addColorStop(0, `rgba(${(90 + lit * 140) | 0},${(50 + lit * 40) | 0},${(110 - lit * 30) | 0},${0.1 + lit * 0.1})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1;
    g.fillStyle = gr;
    g.save();
    g.translate(cx, cy);
    g.scale(1, ry / rx);
    g.translate(-cx, -cy);
    g.beginPath();
    g.arc(cx, cy, rx, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.globalAlpha = 1;
}

const FAR = { seed: 11, top: '#2a2346', bottom: '#3c2849', minW: 0.012, maxW: 0.034, minH: 0.12, maxH: 0.36, tall: 0.18, gap: 0.002, floor: 3, col: 2.4, lit: 0.3, glow: 0.5, glass: 0, side: 0, scale: 0.5, haze: 'rgba(255,130,110,.4)', hazeH: 0.75, fog: 'rgba(80,45,100,.28)', bloom: 0.55, bloomR: 2 };
const MID = { seed: 29, top: '#171329', bottom: '#241731', sideTop: '#100d1f', sideBottom: '#1a1124', minW: 0.02, maxW: 0.05, minH: 0.2, maxH: 0.5, tall: 0.2, gap: 0.004, floor: 4.5, col: 3.4, lit: 0.3, glow: 0.7, glass: 0.03, side: 0.12, scale: 0.8, rim: 'rgba(170,190,255,.5)', haze: 'rgba(255,110,80,.3)', hazeH: 0.6, fog: 'rgba(40,25,70,.16)', bloom: 0.65, bloomR: 3 };
const NEAR = { seed: 47, top: '#0c0a16', bottom: '#150e1b', sideTop: '#08070f', sideBottom: '#0f0a14', minW: 0.045, maxW: 0.1, minH: 0.28, maxH: 0.62, tall: 0.18, gap: 0.006, floor: 6.5, col: 4.6, lit: 0.24, glow: 0.8, glass: 0.05, side: 0.16, scale: 1.2, rim: 'rgba(255,190,150,.5)', haze: 'rgba(255,100,60,.24)', hazeH: 0.45, bloom: 0.8, bloomR: 5, signs: 0.35, boards: 0.22 };
const FRONT = { seed: 71, top: '#07060c', bottom: '#0f0a15', sideTop: '#040308', sideBottom: '#0a070e', floor: 8, col: 5.5, lit: 0.17, glow: 0.85, glass: 0.045, side: 0.2, scale: 1.6, strip: 22, haze: 'rgba(255,90,60,.18)', hazeH: 0.35, bloom: 0.9, bloomR: 6 };

// wiezowce na pierwszym planie (ulamki szerokosci/wysokosci warstwy); hologramy w JSX sa przypiete do tych samych liczb
const BLOCKS_WIDE = [
  { x: 0.665, w: 0.13, top: 0.34, led: '#ff2a6d' },
  { x: 0.835, w: 0.2, top: -0.05, led: '#00f0ff' },
];
const BLOCKS_NARROW = [{ x: 0.7, w: 0.34, top: 0.42, led: '#00f0ff' }];

// ---------- animowana warstwa: deszcz i latajace pojazdy ----------
function makeFx(w, h) {
  const rnd = rng(99);
  const lanes = [
    { y: 0.2, v: 26, s: 0.5, dir: 1, n: 4 },
    { y: 0.26, v: -38, s: 0.65, dir: -1, n: 3 },
    { y: 0.33, v: 60, s: 0.85, dir: 1, n: 3 },
    { y: 0.4, v: -95, s: 1.15, dir: -1, n: 2 },
  ];
  const cars = lanes.flatMap((ln) => Array.from({ length: ln.n }, () => ({ ...ln, x: rnd() * w, wob: rnd() * 6.28, y0: ln.y * h + (rnd() - 0.5) * 14 })));
  const drops = Array.from({ length: Math.round((w * h) / 7000) }, () => ({ x: rnd() * w, y: rnd() * h, l: 8 + rnd() * 16, v: 520 + rnd() * 380, a: rnd() < 0.15 }));
  return { cars, drops, w, h };
}

function drawFx(g, fx, dt, t) {
  const { w, h } = fx;
  g.clearRect(0, 0, w, h);
  // deszcz
  g.lineWidth = 1;
  g.strokeStyle = 'rgba(180,200,255,.16)';
  g.beginPath();
  fx.drops.forEach((d) => {
    d.y += d.v * dt;
    d.x += d.v * dt * 0.12;
    if (d.y > h) {
      d.y = -d.l;
      d.x = Math.random() * w;
    }
    if (!d.a) {
      g.moveTo(d.x, d.y);
      g.lineTo(d.x + d.l * 0.12, d.y + d.l);
    }
  });
  g.stroke();
  g.strokeStyle = 'rgba(200,215,255,.32)';
  g.beginPath();
  fx.drops.forEach((d) => {
    if (d.a) {
      g.moveTo(d.x, d.y);
      g.lineTo(d.x + d.l * 0.18, d.y + d.l * 1.6);
    }
  });
  g.stroke();
  // pojazdy: swiatla z przodu, czerwone z tylu, smuga
  g.globalCompositeOperation = 'lighter';
  fx.cars.forEach((c) => {
    c.x += c.v * dt;
    if (c.x > w + 60) c.x = -60;
    if (c.x < -60) c.x = w + 60;
    const y = c.y0 + Math.sin(t / 900 + c.wob) * 2;
    const s = c.s;
    const tr = g.createLinearGradient(c.x, y, c.x - c.dir * 70 * s, y);
    tr.addColorStop(0, `rgba(255,80,90,${0.55 * s})`);
    tr.addColorStop(1, 'rgba(255,80,90,0)');
    g.fillStyle = tr;
    g.fillRect(Math.min(c.x, c.x - c.dir * 70 * s), y - 0.8 * s, 70 * s, 1.6 * s);
    g.fillStyle = 'rgba(30,20,40,.9)';
    g.fillRect(c.x - 6 * s, y - 1.6 * s, 12 * s, 3.2 * s);
    g.fillStyle = 'rgba(255,250,235,.95)';
    g.beginPath();
    g.arc(c.x + c.dir * 6 * s, y, 1.5 * s, 0, 6.29);
    g.fill();
    g.fillStyle = 'rgba(255,40,60,.95)';
    g.beginPath();
    g.arc(c.x - c.dir * 6 * s, y, 1.2 * s, 0, 6.29);
    g.fill();
    const glow = g.createRadialGradient(c.x + c.dir * 6 * s, y, 0, c.x + c.dir * 6 * s, y, 10 * s);
    glow.addColorStop(0, 'rgba(255,240,210,.35)');
    glow.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = glow;
    g.fillRect(c.x + c.dir * 6 * s - 10 * s, y - 10 * s, 20 * s, 20 * s);
  });
  g.globalCompositeOperation = 'source-over';
}

export default function City({ mouse, ad }) {
  const root = useRef(null);
  const sky = useRef(null);
  const cv = { far: useRef(null), mid: useRef(null), near: useRef(null), front: useRef(null) };
  const lay = { far: useRef(null), mid: useRef(null), near: useRef(null), front: useRef(null) };
  const fxc = useRef(null);
  const fx = useRef(null);
  const narrow = useRef(false);
  const last = useRef(0);

  useEffect(() => {
    const draw = () => {
      const el = root.current;
      if (!el) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.min(el.clientWidth + 80, 2600);
      const h = el.clientHeight;
      if (!w || !h) return;
      narrow.current = el.clientWidth < 760;
      el.classList.toggle('narrow', narrow.current);
      drawSky(sky.current, el.clientWidth, h, dpr);
      drawRow(cv.far.current, { ...FAR, maxH: FAR.maxH + (narrow.current ? 0.1 : 0) }, w, h, dpr);
      drawRow(cv.mid.current, MID, w, h, dpr);
      drawRow(cv.near.current, narrow.current ? { ...NEAR, maxH: 0.48 } : NEAR, w, h, dpr);
      drawFront(cv.front.current, FRONT, w, h, dpr, narrow.current ? BLOCKS_NARROW : BLOCKS_WIDE);
      const f = fxc.current;
      f.width = Math.round(el.clientWidth * dpr);
      f.height = Math.round(h * dpr);
      f.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.current = makeFx(el.clientWidth, h);
      if (reduceMotion) drawFx(f.getContext('2d'), fx.current, 0, 0);
    };
    // czcionki potrzebne do napisow na szyldach
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    let alive = true;
    ready.then(() => alive && draw());
    let timer;
    let lastW = window.innerWidth;
    const onResize = () => {
      if (Math.abs(window.innerWidth - lastW) < 2 && window.innerWidth < 760) return; // pasek adresu na telefonie
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(draw, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, []);

  useFrame((s, t) => {
    const el = root.current;
    if (!el || reduceMotion) return;
    const hh = el.offsetHeight;
    if (s.y > hh * 1.3 || document.hidden) return;
    const m = mouse.current;
    const set = (r, k, my) => r.current && (r.current.style.transform = `translate3d(${(m.x * -k).toFixed(1)}px, ${(s.y * my + m.y * -k * 0.4).toFixed(1)}px, 0)`);
    set(lay.far, 4, 0.04);
    set(lay.mid, 9, 0.09);
    set(lay.near, 18, 0.17);
    set(lay.front, 34, 0.26);
    if (fx.current && fxc.current) {
      const dt = Math.min(0.05, (t - (last.current || t)) / 1000);
      last.current = t;
      drawFx(fxc.current.getContext('2d'), fx.current, dt, t);
    }
  });

  return (
    <div ref={root} className="cty" aria-hidden="true">
      <canvas ref={sky} className="cty-sky" />
      <div ref={lay.far} className="cty-l"><canvas ref={cv.far} /></div>
      <div ref={lay.mid} className="cty-l">
        <canvas ref={cv.mid} />
        <i className="search s1" />
        <i className="search s2" />
      </div>
      <div className="cty-street" />
      <div ref={lay.near} className="cty-l"><canvas ref={cv.near} /></div>
      <div ref={lay.front} className="cty-l">
        <canvas ref={cv.front} />
        <div className="roof-sign">
          {[...'GDAŃSK'].map((ch, i) => <span key={i} className={i === 3 ? 'flick' : ''}>{ch}</span>)}
        </div>
        <div className="holo-v"><span>ファームウェア</span></div>
        <div className="holo-ad">
          {ad.map((a, i) => (
            <div key={i} className="ad-slide" style={{ '--n': i }}>
              <small>{a.kicker}</small>
              <strong>{a.title}</strong>
              <em>{a.sub}</em>
            </div>
          ))}
        </div>
      </div>
      <canvas ref={fxc} className="cty-fx" />
      <div className="cty-grade" />
    </div>
  );
}
