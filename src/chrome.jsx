import { useEffect, useRef, useState } from 'react';
import { clamp, cx, finePointer, lerp, reduceMotion, useFrame } from './hooks.js';
import { useLang, useT } from './i18n.js';

// ---------- ekran startowy: lamanie zabezpieczen (breach protocol) ----------
// Wszystko liczy sie z jednego zegara `ms`, wiec pominiecie to po prostu przeskok czasu.
const CODES = ['1C', 'BD', '55', 'E9', '7A', 'FF'];
const N = 5;
// sciezka wyboru: na zmiane wiersz i kolumna, jak w grze
const PATH = [[0, 2], [3, 2], [3, 0], [1, 0], [1, 4]];
const PICKS = ['1C', 'BD', '55', 'E9', '1C'];
const DAEMONS = [
  { name: 'ACCESS_PORTFOLIO', seq: ['1C', 'BD', '55'] },
  { name: 'BYPASS_FIREWALL', seq: ['55', 'E9'] },
  { name: 'DOWNLOAD_PROFILE', seq: ['E9', '1C'] },
];
const MATRIX = (() => {
  const pick = (r, c) => {
    let h = Math.imul(r * 31 + c * 17 + 11, 0x9e3779b1);
    h ^= h >>> 15;
    return CODES[(h >>> 0) % CODES.length];
  };
  const m = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => pick(r, c)));
  PATH.forEach(([r, c], i) => (m[r][c] = PICKS[i]));
  return m;
})();
const INTRO = 650;
const PICK = 430;
const GRANT = INTRO + PICKS.length * PICK;
const END = GRANT + 1050;

// ile poczatkowych kodow sekwencji pasuje do konca bufora (albo cala sekwencja juz byla)
function matched(seq, buf) {
  for (let s = 0; s + seq.length <= buf.length; s++) if (seq.every((c, k) => buf[s + k] === c)) return seq.length;
  for (let m = Math.min(seq.length - 1, buf.length); m > 0; m--) if (seq.slice(0, m).every((c, k) => buf[buf.length - m + k] === c)) return m;
  return 0;
}

export function Loader({ onDone }) {
  const { UI } = useT();
  const [ms, setMs] = useState(0);
  const [phase, setPhase] = useState(reduceMotion ? 'gone' : 'on');
  const skip = useRef(false);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const html = document.documentElement;
    html.classList.add('booting');
    let raf;
    let timer;
    let t0 = performance.now();
    const finish = () => {
      setPhase('out');
      onDone();
      timer = setTimeout(() => {
        setPhase('gone');
        html.classList.remove('booting');
      }, 850);
    };
    const step = (t) => {
      // pominiecie: skok od razu do "ACCESS GRANTED", ktore wtedy trwa krocej
      if (skip.current) {
        skip.current = false;
        if (t - t0 < GRANT) t0 = t - GRANT;
        t0 -= 450;
      }
      const e = t - t0;
      setMs(e);
      if (e < END) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    const key = () => (skip.current = true);
    window.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('keydown', key);
      html.classList.remove('booting');
    };
  }, []);

  if (phase === 'gone') return null;

  // stan z zegara
  const k = (ms - INTRO) / PICK; // ktory wybor trwa (ulamek = postep w jego obrebie)
  const i = Math.floor(k);
  const done = clamp(Math.floor(k + 0.35), 0, PICKS.length); // kod "wpada" do bufora pod koniec swojego okna
  const buf = PICKS.slice(0, done);
  const active = ms >= INTRO && i < PICKS.length ? i : -1;
  const band = active < 0 ? null : active % 2 === 0 ? { row: active === 0 ? 0 : PATH[active - 1][0] } : { col: PATH[active - 1][1] };
  // kursor przeskakuje po pasku, zanim trafi w cel
  let hover = null;
  if (band) {
    const [tr, tc] = PATH[active];
    const target = band.row !== undefined ? tc : tr;
    const f = clamp((k - i) / 0.65);
    const from = (target + 3) % N;
    const pos = Math.round(from + (target - from) * f);
    hover = band.row !== undefined ? [band.row, pos] : [pos, band.col];
  }
  const used = (r, c) => PATH.slice(0, done).some(([pr, pc]) => pr === r && pc === c);
  const granted = ms >= GRANT;
  const time = Math.max(0, 9.98 - Math.min(ms, GRANT) * 0.0021);

  return (
    <div className={cx('loader', phase === 'out' && 'out', granted && 'granted')} onClick={() => (skip.current = true)} role="status" aria-label={UI.loading}>
      <div className="loader-top" />
      <div className="loader-bottom" />
      <div className="bp" aria-hidden="true">
        <div className="bp-head">
          <span className="bp-title">BREACH PROTOCOL</span>
          <span className="bp-time">
            <small>BREACH TIME REMAINING</small>
            <b>{time.toFixed(2)}</b>
          </span>
        </div>
        <div className="bp-timer"><i style={{ transform: `scaleX(${(time / 9.98).toFixed(3)})` }} /></div>
        <div className="bp-grid">
          <section className="bp-panel">
            <h3>CODE MATRIX</h3>
            <div className="bp-matrix">
              {MATRIX.map((row, r) =>
                row.map((code, c) => {
                  const inBand = band && (band.row === r || band.col === c);
                  const isHover = hover && hover[0] === r && hover[1] === c;
                  return (
                    <span key={`${r}-${c}`} className={cx('bp-cell', inBand && 'band', isHover && 'hover', used(r, c) && 'used')} style={{ '--i': r * N + c }}>
                      {used(r, c) ? '[ ]' : code}
                    </span>
                  );
                })
              )}
            </div>
          </section>
          <section className="bp-side">
            <div className="bp-panel">
              <h3>BUFFER</h3>
              <div className="bp-buffer">
                {Array.from({ length: 6 }, (_, j) => (
                  <span key={j} className={cx(j < buf.length && 'on')}>{buf[j] || ''}</span>
                ))}
              </div>
            </div>
            <div className="bp-panel">
              <h3>SEQUENCE REQUIRED TO UPLOAD</h3>
              <ul className="bp-daemons">
                {DAEMONS.map((d) => {
                  const m = matched(d.seq, buf);
                  const ok = m === d.seq.length;
                  return (
                    <li key={d.name} className={cx(ok && 'ok')}>
                      <span className="bp-seq">
                        {d.seq.map((c, j) => <b key={j} className={cx(j < m && 'hit')}>{c}</b>)}
                      </span>
                      <span className="bp-name">{d.name}</span>
                      <span className="bp-state">{ok ? 'UPLOADED' : ''}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>
        <p className="loader-skip">{UI.skip}</p>
      </div>
      {granted && (
        <div className="bp-granted" aria-hidden="true">
          <p className="bp-big" data-text="ACCESS GRANTED">ACCESS GRANTED</p>
          <p className="bp-sub">3/3 DAEMONS UPLOADED <span>//</span> WELCOME TO MATEUSZ_SOBCZAK.SYS</p>
        </div>
      )}
    </div>
  );
}

// ---------- celownik zamiast kursora (tylko mysz) ----------
export function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: -100, y: -100, rx: -100, ry: -100 });
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!finePointer || reduceMotion) return undefined;
    setOn(true);
    document.documentElement.classList.add('has-reticle');
    const move = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      const hot = !!(e.target.closest && e.target.closest('a, button, [data-hot]'));
      if (ring.current) ring.current.classList.toggle('hot', hot);
    };
    const down = () => ring.current && ring.current.classList.add('down');
    const up = () => ring.current && ring.current.classList.remove('down');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      document.documentElement.classList.remove('has-reticle');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  useFrame(() => {
    if (!on) return;
    const c = pos.current;
    c.rx = lerp(c.rx, c.x, 0.2);
    c.ry = lerp(c.ry, c.y, 0.2);
    if (dot.current) dot.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    if (ring.current) ring.current.style.transform = `translate3d(${c.rx}px, ${c.ry}px, 0)`;
  });

  if (!on) return null;
  return (
    <>
      <div ref={ring} className="reticle" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <div ref={dot} className="reticle-dot" aria-hidden="true" />
    </>
  );
}

// ---------- gorny pasek: nawigacja, aktywna sekcja, postep scrolla ----------
export function Header() {
  const { NAV, UI } = useT();
  const { lang, setLang } = useLang();
  const bar = useRef(null);
  const hdr = useRef(null);
  const [active, setActive] = useState('');
  const lastActive = useRef('');

  useFrame((s) => {
    if (bar.current) bar.current.style.transform = `scaleX(${(s.y / s.max).toFixed(4)})`;
    if (hdr.current) hdr.current.classList.toggle('hide', s.y > 260 && s.dir > 0);
    let cur = '';
    for (const [id] of NAV) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < s.vh * 0.45) cur = id;
    }
    if (cur !== lastActive.current) {
      lastActive.current = cur;
      setActive(cur);
    }
  });

  const go = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="progress" aria-hidden="true">
        <i ref={bar} />
      </div>
      <header ref={hdr} className="bar">
        <div className="wrap bar-in">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }}>
            M.SOBCZAK
          </a>
          <nav aria-label={UI.sections}>
            <ul className="nav">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className={cx(active === id && 'on')} onClick={(e) => go(e, id)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" className="lang" onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')} aria-label={UI.switchLang}>
            <span className={cx(lang === 'pl' && 'on')}>PL</span>
            <span className={cx(lang === 'en' && 'on')}>EN</span>
          </button>
        </div>
      </header>
    </>
  );
}
