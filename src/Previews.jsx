import { cx, useInView } from './hooks.js';

// Ilustracje projektow (nie zrzuty ekranu). Rysuja sie, gdy karta wjedzie na ekran.
// Zeby pokazac prawdziwy zrzut, dodaj `image` do projektu w data.js.

function Erd() {
  const T = [
    { x: 14, y: 14, n: 'clients' },
    { x: 150, y: 14, n: 'projects', hot: true },
    { x: 286, y: 14, n: 'payments' },
    { x: 14, y: 96, n: 'suppliers' },
    { x: 150, y: 96, n: 'stages' },
    { x: 286, y: 96, n: 'deliveries' },
  ];
  return (
    <>
      <path className="pv-line" pathLength="1" d="M114 34 H150 M250 34 H286 M200 62 V96 M250 114 H286 M114 120 C200 150 250 150 300 144 M336 62 V96" />
      {T.map((t, i) => (
        <g key={t.n} className="pv-pop" style={{ '--i': i }}>
          <rect className={cx('pv-box', t.hot && 'hot')} x={t.x} y={t.y} width="100" height="48" />
          <rect className={cx('pv-head', t.hot && 'hot')} x={t.x} y={t.y} width="100" height="14" />
          <text className="pv-t" x={t.x + 6} y={t.y + 10.5}>{t.n}</text>
          <rect className="pv-row" x={t.x + 6} y={t.y + 21} width="58" height="4" />
          <rect className="pv-row" x={t.x + 6} y={t.y + 30} width="74" height="4" />
          <rect className="pv-row" x={t.x + 6} y={t.y + 39} width="44" height="4" />
        </g>
      ))}
    </>
  );
}

function Market() {
  return (
    <>
      {[30, 70, 110, 150].map((y) => <line key={y} className="pv-grid" x1="14" x2="386" y1={y} y2={y} />)}
      <path className="pv-area" d="M14 120 L60 104 L106 110 L152 86 L198 92 L244 64 L290 72 L336 44 L386 50 V160 H14 Z" />
      <path className="pv-line y" pathLength="1" d="M14 120 L60 104 L106 110 L152 86 L198 92 L244 64 L290 72 L336 44 L386 50" />
      <path className="pv-line c" pathLength="1" d="M14 96 L60 100 L106 92 L152 104 L198 110 L244 106 L290 118 L336 114 L386 124" />
      <path className="pv-line p" pathLength="1" d="M14 134 L60 128 L106 136 L152 124 L198 128 L244 120 L290 126 L336 118 L386 116" />
      <g className="pv-pop" style={{ '--i': 4 }}>
        <text className="pv-t y" x="20" y="22">SHARE</text>
        <text className="pv-t c" x="74" y="22">COMMODITY</text>
        <text className="pv-t p" x="152" y="22">CURRENCY</text>
      </g>
    </>
  );
}

function Routes() {
  const ranks = [92, 78, 64];
  return (
    <>
      <path className="pv-area" d="M14 150 L44 128 L70 136 L104 92 L130 104 L166 52 L196 74 L222 66 L250 110 L276 120 L300 150 Z" />
      <path className="pv-line y" pathLength="1" d="M14 150 L44 128 L70 136 L104 92 L130 104 L166 52 L196 74 L222 66 L250 110 L276 120 L300 150" />
      <g className="pv-pop" style={{ '--i': 3 }}>
        <path className="pv-flag" d="M166 52 V30 L180 36 L166 42" />
      </g>
      {ranks.map((r, i) => (
        <g key={i} className="pv-pop" style={{ '--i': 4 + i }}>
          <text className="pv-t" x="316" y={56 + i * 34}>#{i + 1}</text>
          <rect className="pv-row" x="338" y={49 + i * 34} width="48" height="8" />
          <rect className={cx('pv-bar', i === 0 && 'hot')} x="338" y={49 + i * 34} width={(48 * r) / 100} height="8" />
        </g>
      ))}
    </>
  );
}

function Board() {
  const cells = [2, 0, 4, 0, 8, 16, 0, 2, 32, 64, 128, 4, 2048, 1024, 256, 512];
  return (
    <>
      <rect className="pv-box" x="122" y="8" width="156" height="156" />
      {cells.map((v, i) => {
        const x = 128 + (i % 4) * 37.5;
        const y = 14 + Math.floor(i / 4) * 37.5;
        return (
          <g key={i} className={v ? 'pv-pop' : ''} style={{ '--i': i * 0.4 }}>
            <rect className={cx('pv-tile', v && `v${Math.min(v, 2048)}`)} x={x} y={y} width="32" height="32" />
            {v > 0 && <text className="pv-num" x={x + 16} y={y + 20}>{v}</text>}
          </g>
        );
      })}
    </>
  );
}

const ART = { db: Erd, stock: Market, routes: Routes, game: Board };

export default function Preview({ kind, image, alt }) {
  const [ref, inView] = useInView({ rootMargin: '0px 0px -12% 0px' });
  if (image) {
    return (
      <div className="pv">
        <img src={image} alt={alt} loading="lazy" />
      </div>
    );
  }
  const Art = ART[kind];
  if (!Art) return null;
  return (
    <div ref={ref} className={cx('pv', inView && 'in')} aria-hidden="true">
      <svg viewBox="0 0 400 172" focusable="false">
        <Art />
      </svg>
    </div>
  );
}
