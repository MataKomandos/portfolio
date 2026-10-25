import { useRef, useState } from 'react';
import { CV_FILE, EMAIL, FORM_ENDPOINT, GITHUB, LINKEDIN, REPO_BASE } from './data.js';
import { clamp, cx, reduceMotion, useFrame, useInView } from './hooks.js';
import { useT } from './i18n.js';
import Preview from './Previews.jsx';
import { Arrow, Chips, CopyRow, Download, Magnetic, Reveal, Rich, Scramble, ScrollWords, SectionTitle, Terminal, Tilt } from './ui.jsx';

// ---------- pasek tekstu, ktory przechyla sie z predkoscia scrolla ----------
export function Ticker({ a, b, big = false }) {
  const { TICKER_A, TICKER_B } = useT();
  const r1 = useRef(null);
  const r2 = useRef(null);
  useFrame((s) => {
    if (reduceMotion) return;
    const v = clamp(s.vel * 0.3, -12, 12);
    const t = `skewX(${(-v).toFixed(2)}deg)`;
    if (r1.current) r1.current.style.transform = t;
    if (r2.current) r2.current.style.transform = t;
  });
  const row = (items, cls, ref) => (
    <div className={cx('tk', cls)} ref={ref}>
      <div className="tk-run">
        {[0, 1, 2, 3].map((k) => (
          <ul key={k}>
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
  return (
    <div className={cx('ticker', big && 'big')} aria-hidden="true">
      {row(a || TICKER_A, 'solid', r1)}
      {row(b || TICKER_B, 'line rev', r2)}
    </div>
  );
}

// ---------- profil ----------
export function Profile() {
  const { PROFILE_TEXT, PROFILE_NOTE, TERMINAL, UI } = useT();
  return (
    <section id="profile" className="sec">
      <div className="wrap">
        <SectionTitle>{UI.profile}</SectionTitle>
        <div className="profile">
          <div className="profile-text">
            <ScrollWords text={PROFILE_TEXT} className="big" />
            <Reveal v="up" as="p" className="note">{PROFILE_NOTE}</Reveal>
          </div>
          <Reveal v="right" delay={120}>
            <Terminal lines={TERMINAL} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- portfolio ----------
function Wave() {
  const [ref, inView] = useInView();
  return (
    <svg ref={ref} className={cx('trace', inView && 'in')} viewBox="0 0 240 48" aria-hidden="true" focusable="false">
      <line x1="42" y1="2" x2="42" y2="46" />
      <line x1="114" y1="2" x2="114" y2="46" />
      <line x1="186" y1="2" x2="186" y2="46" />
      <path pathLength="1" d="M0 8 H24 V40 H42 V8 H60 V40 H78 V8 H114 V40 H150 V8 H168 V40 H186 V8 H240" />
    </svg>
  );
}

export function Portfolio() {
  const { PROJECTS, STAGES, UI } = useT();
  return (
    <section id="portfolio" className="sec">
      <div className="wrap">
        <SectionTitle>{UI.portfolio}</SectionTitle>

        <Reveal v="up">
          <article className="frame cut feature" style={{ '--cut': '24px' }}>
            <div className="panel">
              <div className="feat-head">
                <div>
                  <p className="kicker">{UI.currentRole}</p>
                  <h3>Firmware Validation Engineer</h3>
                  <p className="org">SII</p>
                </div>
                <Wave />
              </div>
              <ul className="stages">
                {STAGES.map((s, i) => (
                  <Reveal as="li" key={s.title} v="pop" delay={i * 110} style={{ '--rot': `${i % 2 ? 1 : -1}deg` }}>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>

        <div className="projects">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.repo} v="pop" delay={(i % 2) * 130} style={{ '--rot': `${i % 2 ? 1.4 : -1.4}deg` }}>
              <Tilt>
                <article className="frame cut proj">
                  <div className="panel">
                    <Preview kind={p.preview} image={p.image} alt={UI.previewAlt(p.title)} />
                    <p className="proj-tag">{p.tag}</p>
                    <h3>{p.title}</h3>
                    <p className="proj-sum">{p.summary}</p>
                    <Chips items={p.chips} />
                    <ul className="bul">
                      {p.bullets.map((b) => (
                        <li key={b}><Rich text={b} /></li>
                      ))}
                    </ul>
                    <a className="repo" href={`${REPO_BASE}${p.repo}`} target="_blank" rel="noopener noreferrer">
                      {UI.viewRepo} <Arrow />
                    </a>
                  </div>
                </article>
              </Tilt>
            </Reveal>
          ))}
        </div>

        <Reveal v="up" className="more">
          <Magnetic>
            <a className="btn btn-primary cut" href={GITHUB} target="_blank" rel="noopener noreferrer">
              {UI.allRepos} <Arrow />
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- umiejetnosci ----------
function Bars({ n, delay }) {
  const [ref, inView] = useInView();
  return (
    <span ref={ref} className={cx('meter', inView && 'in')} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i < n ? 'on' : ''} style={{ '--i': i, '--b': delay }} />
      ))}
    </span>
  );
}

export function Skills() {
  const { LANGUAGES, SKILLS, UI } = useT();
  return (
    <section id="skills" className="sec">
      <div className="wrap">
        <SectionTitle>{UI.skills}</SectionTitle>
        <div className="skills">
          <Reveal v="pop" className="frame cut" style={{ '--rot': '-1deg' }}>
            <div className="panel">
              <h3>{UI.techData}</h3>
              <Chips items={SKILLS.tech} />
            </div>
          </Reveal>
          <Reveal v="pop" delay={120} className="frame cut" style={{ '--rot': '1deg' }}>
            <div className="panel">
              <h3>{UI.infra}</h3>
              <Chips items={SKILLS.infra} />
              <p className="sub">{UI.ai}</p>
              <Chips items={SKILLS.ai} />
            </div>
          </Reveal>
          <Reveal v="pop" delay={240} className="frame cut" style={{ '--rot': '-1deg' }}>
            <div className="panel">
              <h3>{UI.langs}</h3>
              <ul className="langs">
                {LANGUAGES.map((l, i) => (
                  <li key={l.name}>
                    <span>{l.name}</span>
                    <span className="lvl">{l.level}</span>
                    <Bars n={l.bars} delay={i * 160} />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- edukacja i certyfikaty ----------
function Timeline({ items }) {
  const ref = useRef(null);
  const dots = useRef([]);
  useFrame((s) => {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const p = clamp((s.vh * 0.78 - r.top) / r.height);
    ref.current.style.setProperty('--p', p.toFixed(3));
    dots.current.forEach((d, i) => d && d.classList.toggle('on', p >= (i + 0.3) / items.length));
  });
  return (
    <ol ref={ref} className={cx('tl', reduceMotion && 'static')}>
      {items.map((c, i) => (
        <li key={c.name} ref={(el) => (dots.current[i] = el)} className={reduceMotion ? 'on' : ''}>
          <time>{c.date}</time>
          <strong>{c.name}</strong>
        </li>
      ))}
    </ol>
  );
}

export function Education() {
  const { CERTIFICATES, EDUCATION, UI } = useT();
  return (
    <section id="education" className="sec">
      <div className="wrap">
        <SectionTitle>{UI.education}</SectionTitle>
        <div className="duo">
          <Reveal v="left" className="frame cut">
            <div className="panel">
              <h3>{UI.education}</h3>
              <ul className="edu">
                {EDUCATION.map((e) => (
                  <li key={e.place}>
                    <h4>{e.place}</h4>
                    <p>{e.what}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal v="right" delay={120} className="frame cut">
            <div className="panel">
              <h3>{UI.certificates}</h3>
              <Timeline items={CERTIFICATES} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- kontakt ----------
function LinkRow({ label, href, text, action, icon }) {
  const ext = href.startsWith('http');
  return (
    <div className="row">
      <dt>{label}</dt>
      <dd>
        <a href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}>{text}</a>
      </dd>
      <span className="act">
        <a className="copy" href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}>
          {action} {icon}
        </a>
      </span>
    </div>
  );
}

function ContactForm() {
  const { UI } = useT();
  const f = UI.form;
  const [state, setState] = useState('idle');
  const send = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (data._honey) return; // pole-pulapka dla botow
    setState('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, _subject: f.subject, _template: 'table', _captcha: 'false' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === 'false') throw new Error(json.message || res.status);
      setState('sent');
      e.target.reset();
    } catch (err) {
      setState('error');
    }
  };
  return (
    <form className="form" onSubmit={send}>
      <h4>{f.title}</h4>
      <label>
        <span>{f.name}</span>
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        <span>{f.email}</span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" />
      </label>
      <label>
        <span>{f.message}</span>
        <textarea name="message" required rows={5} maxLength={5000} />
      </label>
      <input className="honey" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn btn-primary cut" disabled={state === 'sending'}>
        {state === 'sending' ? f.sending : f.send} <Arrow />
      </button>
      <p className={cx('form-msg', state)} role="status">
        {state === 'sent' && f.sent}
        {state === 'error' && (
          <>
            {f.error} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </>
        )}
      </p>
    </form>
  );
}

export function Contact() {
  const { PROFILE_NOTE, UI } = useT();
  return (
    <section id="contact" className="sec contact">
      <div className="wrap">
        <SectionTitle>{UI.contact}</SectionTitle>
        <h3 className="mega">
          <Scramble text={UI.mega} duration={1100} />
        </h3>
        <Reveal v="up" as="p" className="say">{PROFILE_NOTE}</Reveal>
        <div className="contact-grid">
        <Reveal v="pop" className="frame cut" style={{ '--cut': '24px' }}>
          <div className="panel">
            <dl className="rows">
              <CopyRow label={UI.email} value={EMAIL} />
              <LinkRow label={UI.cvRow} href={CV_FILE} text={UI.cvFile} action={UI.download} icon={<Download />} />
              <LinkRow label="GitHub" href={GITHUB} text="github.com/MataKomandos" action={UI.open} icon={<Arrow />} />
              {LINKEDIN && (
                <LinkRow label="LinkedIn" href={LINKEDIN} text={LINKEDIN.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} action={UI.open} icon={<Arrow />} />
              )}
            </dl>
          </div>
        </Reveal>
        <Reveal v="pop" delay={140} className="frame cut" style={{ '--cut': '24px' }}>
          <div className="panel">
            <ContactForm />
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { UI } = useT();
  const name = 'Mateusz Sobczak';
  return (
    <footer className="foot">
      <Ticker big a={[name, name, name]} b={[UI.openToWork, UI.openToWork, UI.openToWork]} />
      <div className="wrap foot-in">
        <span>&copy; 2026 Mateusz Sobczak</span>
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }}>
          {UI.backToTop}
        </a>
      </div>
    </footer>
  );
}
