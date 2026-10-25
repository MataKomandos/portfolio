import { useEffect, useRef, useState } from 'react';
import { reduceMotion, useFrame } from './hooks.js';

// ---------- sciezka sygnalu: jak na plytce drukowanej, biegnie wzdluz calej strony ----------
// Impuls plynie razem ze scrollem. Kiedy dotrze do sekcji, sekcja dostaje klase "on"
// i "wlacza sie" (style w styles.css, sekcja "zasilanie sekcji").

const HEAD = 0.62; // na jakiej wysokosci ekranu jest impuls
const TRAIL = 130;

function build(main) {
  const mr = main.getBoundingClientRect();
  const secs = [...main.querySelectorAll('.sec')];
  const wrap = secs[0] && secs[0].querySelector('.wrap');
  if (!wrap) return null;
  const left = wrap.getBoundingClientRect().left - mr.left + parseFloat(getComputedStyle(wrap).paddingLeft);
  const x = left >= 52 ? left - 36 : Math.max(5, left / 2);
  const amp = Math.min(18, x - 8);

  const nodes = secs.map((sec, i) => {
    const t = (sec.querySelector('.title') || sec).getBoundingClientRect();
    return { sec, i, y: t.top + t.height / 2 - mr.top, x2: t.left - mr.left - 8 };
  });
  const y0 = secs[0].getBoundingClientRect().top - mr.top + 8;
  const yEnd = mr.height - 56;

  // pien: pionowo, miedzy sekcjami odbija w bok pod katem 45 stopni
  const pts = [[x, y0]];
  const vias = [];
  nodes.forEach((n, i) => {
    const next = i + 1 < nodes.length ? nodes[i + 1].y : yEnd;
    pts.push([x, n.y]);
    if (amp >= 6 && next - n.y > 320) {
      const m = (n.y + next) / 2;
      pts.push([x, m - 80], [x - amp, m - 80 + amp], [x - amp, m + 80 - amp], [x, m + 80]);
      vias.push([x - amp, m]);
    }
  });
  pts.push([x, yEnd]);
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));

  return {
    x, pts, lens, nodes, vias, y0, yEnd,
    total: lens[lens.length - 1],
    top: mr.top + window.scrollY,
    w: mr.width,
    h: mr.height,
    d: 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L'),
  };
}

// dlugosc sciezki do punktu na wysokosci y (pien zawsze idzie w dol, wiec wystarczy y)
function lenAtY(g, y) {
  const { pts, lens } = g;
  if (y <= pts[0][1]) return 0;
  for (let i = 1; i < pts.length; i++) {
    if (y <= pts[i][1]) {
      const [, ya] = pts[i - 1];
      const t = (y - ya) / (pts[i][1] - ya || 1);
      return lens[i - 1] + (lens[i] - lens[i - 1]) * t;
    }
  }
  return g.total;
}

function pointAt(g, len) {
  const { pts, lens } = g;
  for (let i = 1; i < pts.length; i++) {
    if (len <= lens[i]) {
      const t = (len - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
  }
  return pts[pts.length - 1];
}

export default function Circuit() {
  const host = useRef(null);
  const lit = useRef(null);
  const trail = useRef(null);
  const head = useRef(null);
  const pkts = [useRef(null), useRef(null)];
  const nodeEls = useRef([]);
  const reach = useRef(0);
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    const main = host.current && host.current.parentElement;
    if (!main) return undefined;
    let raf;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const g = build(main);
        if (!g) return;
        setGeo(g);
        main.classList.add('wired');
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(main);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      main.classList.remove('wired');
    };
  }, []);

  useFrame((s, t) => {
    const g = geo;
    if (!g) return;
    const y = reduceMotion ? g.yEnd : s.y + s.vh * HEAD - g.top;
    const len = lenAtY(g, Math.min(y, g.yEnd));
    reach.current = Math.max(reach.current, len);
    const max = reach.current;

    g.nodes.forEach((n, i) => {
      if (y < n.y) return;
      n.sec.classList.add('on');
      const el = nodeEls.current[i];
      if (el) el.classList.add('on');
    });

    if (lit.current) lit.current.style.strokeDasharray = `${max.toFixed(1)} ${g.total + 10}`;
    const show = !reduceMotion && len > 0 && len < g.total;
    if (trail.current) {
      trail.current.style.opacity = show ? '1' : '0';
      trail.current.style.strokeDasharray = `${Math.min(TRAIL, len).toFixed(1)} ${g.total + TRAIL}`;
      trail.current.style.strokeDashoffset = (-(len - Math.min(TRAIL, len))).toFixed(1);
    }
    if (head.current) {
      const [hx, hy] = pointAt(g, len);
      head.current.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)})`);
      head.current.style.opacity = show ? '1' : '0';
    }
    // pakiety danych biegna po juz zasilonej czesci sciezki
    pkts.forEach((r, k) => {
      if (!r.current) return;
      if (reduceMotion || max < 200) {
        r.current.style.opacity = '0';
        return;
      }
      const p = ((t || 0) * 0.32 + k * 900) % max;
      const [px, py] = pointAt(g, p);
      r.current.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
      r.current.style.opacity = '1';
    });
  });

  const g = geo;
  const labels = g && g.x > 40;
  return (
    <div ref={host} className="circuit" aria-hidden="true">
      {g && (
        <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} focusable="false">
          <path className="cb-base" d={g.d} />
          <path ref={lit} className="cb-lit" d={g.d} style={{ strokeDasharray: `0 ${g.total + 10}` }} />
          {g.vias.map(([vx, vy], i) => (
            <circle key={i} className="cb-via" cx={vx} cy={vy} r="3.5" />
          ))}
          {g.nodes.map((n, i) => (
            <g key={i} ref={(el) => (nodeEls.current[i] = el)} className="cb-node">
              <path className="cb-stub" d={`M${g.x} ${n.y} H${n.x2}`} />
              <path className="cb-stub-lit" pathLength="1" d={`M${g.x} ${n.y} H${n.x2}`} />
              <circle className="cb-pad" cx={g.x} cy={n.y} r="5" />
              <rect className="cb-end" x={n.x2 - 3} y={n.y - 5} width="6" height="10" />
              {labels && (
                <text className="cb-label" x={g.x - 12} y={n.y + 3} textAnchor="end">{`0x${String(i + 1).padStart(2, '0')}`}</text>
              )}
            </g>
          ))}
          <g className="cb-gnd">
            <path d={`M${g.x - 10} ${g.yEnd} H${g.x + 10} M${g.x - 6} ${g.yEnd + 5} H${g.x + 6} M${g.x - 2.5} ${g.yEnd + 10} H${g.x + 2.5}`} />
          </g>
          <path ref={trail} className="cb-trail" d={g.d} style={{ opacity: 0 }} />
          <circle ref={pkts[0]} className="cb-pkt" r="2" style={{ opacity: 0 }} />
          <circle ref={pkts[1]} className="cb-pkt" r="2" style={{ opacity: 0 }} />
          <g ref={head} className="cb-head" style={{ opacity: 0 }}>
            <circle r="9" className="cb-halo" />
            <circle r="3.2" />
          </g>
        </svg>
      )}
    </div>
  );
}
