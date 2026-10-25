import { useEffect, useRef, useState } from 'react';
import { clamp, cx, finePointer, reduceMotion, useFrame, useInView } from './hooks.js';
import { useLang, useT } from './i18n.js';
import { complete, hint, run } from './shell.js';

// ---------- drobne elementy ----------

export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

// Zamienia `kod` w tekscie na <code>.
export function Rich({ text }) {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

// ---------- pojawianie sie przy scrollu ----------
// v: up | pop | left | right | fade. delay w milisekundach.
export function Reveal({ as: Tag = 'div', v = 'up', delay = 0, className, style, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} data-r={v} className={cx(className, inView && 'in')} style={{ '--d': delay, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

// ---------- dekodowanie tekstu (efekt "hakowania") ----------
const GLYPHS = '!<>-_\\/[]{}=+*^?#0123456789ABCDEF';

export function Scramble({ text, delay = 0, duration = 800, className, as: Tag = 'span' }) {
  const [ref, inView] = useInView();
  const [out, setOut] = useState(text);
  const [started, setStarted] = useState(reduceMotion);

  useEffect(() => {
    if (!inView || reduceMotion) return undefined;
    let raf;
    let timer;
    const begin = () => {
      const t0 = performance.now();
      setStarted(true);
      const step = (t) => {
        const p = clamp((t - t0) / duration);
        const resolved = Math.floor(p * text.length);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          s += ch === ' ' || i < resolved ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        setOut(s);
        if (p < 1) raf = requestAnimationFrame(step);
        else setOut(text);
      };
      raf = requestAnimationFrame(step);
    };
    timer = setTimeout(begin, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView]);

  return (
    <Tag ref={ref} className={cx(className, !started && 'pre')} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  );
}

// ---------- naglowek sekcji ----------
export function SectionTitle({ children, id }) {
  const [ref, inView] = useInView({ rootMargin: '0px 0px -5% 0px' });
  return (
    <h2 className={cx('title', inView && 'in')} ref={ref} id={id}>
      <i className="title-bar" aria-hidden="true" />
      <Scramble text={children} duration={700} />
    </h2>
  );
}

// ---------- karta, ktora lekko sie przechyla za kursorem ----------
export function Tilt({ children, max = 6, className }) {
  const ref = useRef(null);
  const move = (e) => {
    if (reduceMotion || !finePointer || e.pointerType === 'touch') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };
  const leave = () => {
    const el = ref.current;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <div ref={ref} className={cx('tilt', className)} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}

// ---------- przycisk przyciagany przez kursor ----------
export function Magnetic({ children, strength = 0.28 }) {
  const ref = useRef(null);
  const move = (e) => {
    if (reduceMotion || !finePointer) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
  };
  const leave = () => {
    ref.current.style.transform = '';
  };
  return (
    <span ref={ref} className="magnetic" onPointerMove={move} onPointerLeave={leave}>
      {children}
    </span>
  );
}

// ---------- tekst, ktory "zapala sie" slowo po slowie podczas scrollowania ----------
export function ScrollWords({ text, className }) {
  const words = text.split(' ');
  const ref = useRef(null);
  const spans = useRef([]);
  const last = useRef(-1);
  useFrame((s) => {
    if (reduceMotion || !ref.current || s.y === last.current) return;
    last.current = s.y;
    const r = ref.current.getBoundingClientRect();
    const p = clamp((s.vh * 0.86 - r.top) / (r.height + s.vh * 0.28));
    const n = words.length;
    for (let i = 0; i < n; i++) {
      const t = clamp(p * (n + 3) - i);
      const sp = spans.current[i];
      if (sp) sp.style.opacity = (0.16 + 0.84 * t).toFixed(3);
    }
  });
  return (
    <p ref={ref} className={cx('scrollwords', className)}>
      {words.map((w, i) => (
        <span key={i} ref={(el) => (spans.current[i] = el)} style={reduceMotion ? undefined : { opacity: 0.16 }}>
          {w}{' '}
        </span>
      ))}
    </p>
  );
}

// ---------- lista chipow, ktore wyskakuja kolejno ----------
export function Chips({ items, className }) {
  const [ref, inView] = useInView();
  return (
    <ul ref={ref} className={cx('chips', className, inView && 'in')}>
      {items.map((c, i) => (
        <li key={c} className="chip" style={{ '--i': i }}>
          {c}
        </li>
      ))}
    </ul>
  );
}

// ---------- terminal z pisaniem ----------
function frameLines(lines, t) {
  const out = [];
  let rem = t;
  for (const l of lines) {
    if (rem <= 0) break;
    const n = l.cmd.length;
    out.push({ cmd: l.cmd.slice(0, Math.min(n, rem)), typing: rem < n, out: rem >= n + 8 ? l.out : null });
    rem -= n + 8 + 14;
  }
  return out;
}

// fragment linii: tekst, link albo wyrozniony tekst
function Seg({ s }) {
  if (typeof s === 'string') return s;
  if (s.href) {
    const ext = /^https?:/.test(s.href);
    return <a href={s.href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{s.text}</a>;
  }
  return <span className={s.cls}>{s.text}</span>;
}

function Line({ line }) {
  return <div className="out">{Array.isArray(line) ? line.map((s, i) => <Seg key={i} s={s} />) : line}</div>;
}

const PS = 'mateusz@sobczak:~$';

// Najpierw sam wpisuje komendy z data.js (TERMINAL), potem mozna pisac wlasne (shell.js).
export function Terminal({ lines }) {
  const content = useT();
  const { lang, setLang } = useLang();
  const total = lines.reduce((a, l) => a + l.cmd.length + 22, 0);
  const [ref, inView] = useInView({ rootMargin: '0px 0px -15% 0px' });
  const [t, setT] = useState(reduceMotion ? total : 0);
  const [log, setLog] = useState([]);
  const [cleared, setCleared] = useState(false);
  const [val, setVal] = useState('');
  const [focus, setFocus] = useState(false);
  const input = useRef(null);
  const body = useRef(null);
  const hist = useRef([]);
  const hi = useRef(-1);

  useEffect(() => {
    if (!inView || reduceMotion) return undefined;
    const id = setInterval(() => setT((v) => (v >= total ? v : v + 1)), 34);
    return () => clearInterval(id);
  }, [inView]);
  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [log, t]);

  const shown = cleared ? [] : frameLines(lines, t);
  const done = t >= total;

  // klik w terminal: pomija animacje i pozwala od razu pisac (ale nie psuje zaznaczania tekstu)
  const wake = () => {
    if (!done) setT(total);
    if (window.getSelection && String(window.getSelection())) return;
    setTimeout(() => input.current && input.current.focus({ preventScroll: true }), 0);
  };

  const act = (a) => {
    if (!a) return;
    if (a.type === 'download') {
      const el = document.createElement('a');
      el.href = a.href;
      el.download = '';
      document.body.appendChild(el);
      el.click();
      el.remove();
    } else if (a.type === 'open') {
      window.open(a.href, '_blank', 'noopener');
    } else if (a.type === 'goto') {
      const el = document.getElementById(a.id);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    } else if (a.type === 'lang') {
      setTimeout(() => setLang(a.lang), 450);
    }
  };

  const submit = () => {
    const cmd = val;
    const r = run(cmd, { lang, content });
    if (cmd.trim()) hist.current.push(cmd);
    hi.current = -1;
    setVal('');
    if (r.clear) {
      setLog([]);
      setCleared(true);
      return;
    }
    setLog((l) => [...l, { cmd, lines: r.lines, cls: r.cls }]);
    act(r.action);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Tab') {
      if (!val) return;
      e.preventDefault();
      setVal((v) => complete(v));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const h = hist.current;
      if (!h.length) return;
      e.preventDefault();
      let i = hi.current < 0 ? h.length : hi.current;
      i = e.key === 'ArrowUp' ? Math.max(0, i - 1) : i + 1;
      if (i >= h.length) {
        hi.current = -1;
        setVal('');
      } else {
        hi.current = i;
        setVal(h[i]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLog([]);
      setCleared(true);
    }
  };

  return (
    <div ref={ref} className="term frame cut" style={{ '--cut': '16px' }}>
      <div className="panel">
        <div className="term-bar">
          <span>ttyUSB0, 115200 8N1</span>
          <span className="led" aria-hidden="true" />
        </div>
        <div ref={body} className="term-body" onClick={wake}>
          {shown.map((l, i) => (
            <div key={i}>
              <div>
                <span className="ps">{PS}</span> {l.cmd}
                {l.typing && <span className="cursor" aria-hidden="true" />}
              </div>
              {l.out && <div className="out">{l.out}</div>}
            </div>
          ))}
          {done && !cleared && <Line line={hint(lang)} />}
          <div aria-live="polite">
            {log.map((e, i) => (
              <div key={i} className={cx('entry', e.cls)}>
                <div><span className="ps">{PS}</span> {e.cmd}</div>
                {e.lines.map((l, k) => <Line key={k} line={l} />)}
              </div>
            ))}
          </div>
          {(done || shown.length === 0) && (
            <label className="term-in">
              <span className="ps">{PS}</span>
              <span className="term-field">
                <input
                  ref={input}
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={onKey}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  spellCheck="false"
                  autoComplete="off"
                  autoCapitalize="off"
                  enterKeyHint="send"
                  aria-label={content.UI.termInput}
                />
                {!focus && !val && <span className="cursor" aria-hidden="true" />}
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export function Download() {
  return (
    <svg className="arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M8 2v8.5M4.5 7 8 10.5 11.5 7M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

// ---------- wiersz kontaktowy z kopiowaniem ----------
export function CopyRow({ label, value }) {
  const { UI } = useT();
  const [state, setState] = useState('copy');
  const ref = useRef(null);
  const reset = () => setTimeout(() => setState('copy'), 1800);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch (e) {
      try {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        setState('selected');
      } catch (e2) {
        setState('copyManual');
      }
    }
    reset();
  };
  return (
    <div className="row">
      <dt>{label}</dt>
      <dd ref={ref}>{value}</dd>
      <span className="act">
        <button type="button" className="copy" onClick={copy}>
          {UI[state]}
        </button>
      </span>
    </div>
  );
}
