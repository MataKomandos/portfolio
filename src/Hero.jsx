import { useEffect, useRef, useState } from 'react';
import City from './City.jsx';
import { CV_FILE, EMAIL, GITHUB } from './data.js';
import { clamp, cx, lerp, reduceMotion, useFrame } from './hooks.js';
import { useT } from './i18n.js';
import { Arrow, Download, Magnetic } from './ui.jsx';

// ---------- imie: litery wjezdzaja po kolei, potem raz na jakis czas "szarpie" ----------
function NameLine({ text, accent, base }) {
  return (
    <span className={cx('nl', accent && 'accent')} data-text={text} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span className="ch" key={i} style={{ '--i': base + i }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero({ go }) {
  const { UI } = useT();
  const root = useRef(null);
  const copy = useRef(null);
  const hud = useRef(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const onMove = (e) => {
    const r = root.current.getBoundingClientRect();
    mouse.current.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    mouse.current.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };

  useFrame((s) => {
    if (reduceMotion || !root.current) return;
    const hh = root.current.offsetHeight;
    if (s.y > hh * 1.4) return;
    const m = mouse.current;
    m.x = lerp(m.x, m.tx, 0.06);
    m.y = lerp(m.y, m.ty, 0.06);
    const y = s.y;
    if (copy.current) {
      copy.current.style.transform = `translate3d(${(m.x * 6).toFixed(1)}px, ${(y * 0.22).toFixed(1)}px, 0)`;
      copy.current.style.opacity = clamp(1 - y / (s.vh * 0.85)).toFixed(3);
    }
    if (hud.current) hud.current.style.opacity = clamp(1 - y / (s.vh * 0.5)).toFixed(3);
  });

  return (
    <section id="top" ref={root} className={cx('hero', go && 'go')} onPointerMove={onMove} aria-label={UI.intro}>
      <City
        mouse={mouse}
        ad={[
          { kicker: 'NOW HIRING?', title: UI.openToWork, sub: EMAIL },
          { kicker: 'SII // 2026', title: 'FIRMWARE VALIDATION', sub: 'test · debug · ship' },
          { kicker: 'STACK', title: 'JAVA C++ PYTHON SQL', sub: 'PostgreSQL · Linux · Git' },
        ]}
      />
      <div className="hero-fade" aria-hidden="true" />

      <div className="hud" ref={hud} aria-hidden="true">
        <span className="hud-c tl">{UI.hud[0]} {clock}</span>
        <span className="hud-c tr">54.35 N 18.65 E</span>
        <span className="hud-c bl">{UI.hud[1]}</span>
        <span className="hud-c br">{UI.hud[2]}</span>
      </div>

      <div className="wrap hero-grid">
        <div className="hero-copy" ref={copy}>
          <p className="role">
            <span className="led" aria-hidden="true" />
            {UI.role}
          </p>
          <h1 className="name" aria-label="Mateusz Sobczak">
            <NameLine text="MATEUSZ" base={0} />
            <NameLine text="SOBCZAK" base={7} accent />
          </h1>
          <p className="lead">
            {UI.lead[0]}<b>{UI.lead[1]}</b>{UI.lead[2]}<b>{UI.lead[3]}</b>{UI.lead[4]}
          </p>
          <div className="cta">
            <Magnetic>
              <a className="btn btn-primary cut" href="#portfolio">{UI.viewPortfolio}</a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn-ghost cut" href={CV_FILE} download>
                {UI.cv} <Download />
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn-ghost cut" href="#contact">{UI.contact}</a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn-ghost cut" href={GITHUB} target="_blank" rel="noopener noreferrer">
                GitHub <Arrow />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
