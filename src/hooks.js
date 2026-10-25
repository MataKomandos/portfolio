import { useEffect, useRef, useState } from 'react';

const mq = (q) => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(q).matches;

// Gdy ktos ma w systemie wlaczone "ogranicz ruch", wszystkie animacje pokazuja stan koncowy.
export const reduceMotion = mq('(prefers-reduced-motion: reduce)');
export const finePointer = mq('(pointer: fine)');

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const cx = (...c) => c.filter(Boolean).join(' ');

// ---- jedna wspolna petla rAF dla wszystkich animacji zaleznych od scrolla ----
const subs = new Set();
let running = false;
const scroll = { y: 0, vel: 0, vh: 0, max: 1, dir: 0 };

function loop(t) {
  const y = window.scrollY || 0;
  const d = y - scroll.y;
  scroll.vel += (d - scroll.vel) * 0.16;
  if (Math.abs(d) > 0.5) scroll.dir = d > 0 ? 1 : -1;
  scroll.y = y;
  scroll.vh = window.innerHeight;
  scroll.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  subs.forEach((fn) => fn(scroll, t));
  if (subs.size) requestAnimationFrame(loop);
  else running = false;
}

export function useFrame(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const cb = (s, t) => ref.current(s, t);
    subs.add(cb);
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
    return () => {
      subs.delete(cb);
    };
  }, []);
}

// ---- czy element jest w widoku (jednorazowo) ----
export function useInView({ rootMargin = '0px 0px -10% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(reduceMotion || typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}
