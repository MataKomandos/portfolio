// Interaktywny terminal w sekcji Profil: komendy i ich odpowiedzi (EN i PL).
// Linia wyniku to tekst albo tablica fragmentow: 'tekst' | { text, href } | { text, cls }.
// Komendy z `hidden: true` nie pojawiaja sie w `help`.
import { CV_FILE, EMAIL, GITHUB, LINKEDIN, REPO_BASE } from './data.js';

const T = {
  en: {
    hint: ['Type ', { text: 'help', cls: 'k' }, ' and press Enter. Click here to start typing.'],
    helpHead: 'Available commands:',
    helpFoot: 'Psst. A few commands are not on this list.',
    notFound: (c) => [`command not found: ${c}. Try `, { text: 'help', cls: 'k' }, '.'],
    desc: {
      help: 'this list',
      whoami: 'who is behind this page',
      'cat role.txt': 'current job',
      'ls ~/focus': 'what I care about',
      'ls ~/stack': 'tools I work with',
      projects: 'featured projects with links',
      skills: 'full skill list',
      contact: 'how to reach me',
      cv: 'download my CV (PDF)',
      'open <github|linkedin>': 'open a profile in a new tab',
      'goto <section>': 'jump to a section of the page',
      'lang <en|pl>': 'switch language',
      clear: 'clear the screen',
    },
    projects: 'Featured projects (click to open):',
    skills: ['Languages and data: ', 'Infrastructure: ', 'AI tools: '],
    contact: 'Contact:',
    cv: (f) => `Downloading ${f} ... done. Thanks for reading it!`,
    opening: (u) => `Opening ${u} ...`,
    openUsage: 'usage: open <github|linkedin>',
    goto: (s) => `Jumping to ${s} ...`,
    gotoUsage: (list) => `usage: goto <${list}>`,
    lang: (l) => `Language set to ${l === 'pl' ? 'Polish' : 'English'}.`,
    langUsage: 'usage: lang <en|pl>',
    sudoHire: ['[sudo] password for recruiter: ********', 'Access granted. Preparing job offer ...', ['Fastest way to finish this process: ', { text: EMAIL, href: `mailto:${EMAIL}` }]],
    sudo: 'Nice try. This incident will be reported.',
    rm: 'Permission denied. Also, rude.',
    exit: 'There is no escape. Scroll down instead.',
    coffee: ['    ( (', '     ) )', '  ........', '  |      |]', '  \\      /', "   `----'", 'Brewing ... done. Productivity +20%.'],
    vim: "You are now stuck in vim. Type :q to escape (if you can).",
    quit: 'You escaped vim. Achievement unlocked.',
    flash: ['Flashing firmware to /dev/ttyUSB0 ...', '[####################] 100%', 'Verifying checksum ... OK', 'Rebooting ... the page still works, good sign.'],
    ping: 'pong (0.42 ms). Mateusz is online.',
    hello: 'Hi! Nice to see a human here. Type help to look around.',
    game: 'You already won: you found the terminal. Real 2048 is in the Portfolio section.',
    date: () => new Date().toString(),
    echo: (a) => a || '',
  },
  pl: {
    hint: ['Wpisz ', { text: 'help', cls: 'k' }, ' i naciśnij Enter. Kliknij tutaj, żeby zacząć pisać.'],
    helpHead: 'Dostępne komendy:',
    helpFoot: 'Psst. Kilku komend nie ma na tej liście.',
    notFound: (c) => [`nie znaleziono komendy: ${c}. Spróbuj `, { text: 'help', cls: 'k' }, '.'],
    desc: {
      help: 'ta lista',
      whoami: 'kto stoi za tą stroną',
      'cat role.txt': 'obecna praca',
      'ls ~/focus': 'na czym mi zależy',
      'ls ~/stack': 'narzędzia, z których korzystam',
      projects: 'wybrane projekty z linkami',
      skills: 'pełna lista umiejętności',
      contact: 'jak się ze mną skontaktować',
      cv: 'pobierz moje CV (PDF)',
      'open <github|linkedin>': 'otwórz profil w nowej karcie',
      'goto <sekcja>': 'przejdź do sekcji strony',
      'lang <en|pl>': 'zmień język',
      clear: 'wyczyść ekran',
    },
    projects: 'Wybrane projekty (kliknij, żeby otworzyć):',
    skills: ['Języki i dane: ', 'Infrastruktura: ', 'Narzędzia AI: '],
    contact: 'Kontakt:',
    cv: (f) => `Pobieranie ${f} ... gotowe. Dzięki, że zajrzysz!`,
    opening: (u) => `Otwieram ${u} ...`,
    openUsage: 'użycie: open <github|linkedin>',
    goto: (s) => `Przechodzę do: ${s} ...`,
    gotoUsage: (list) => `użycie: goto <${list}>`,
    lang: (l) => `Ustawiono język: ${l === 'pl' ? 'polski' : 'angielski'}.`,
    langUsage: 'użycie: lang <en|pl>',
    sudoHire: ['[sudo] hasło dla rekrutera: ********', 'Dostęp przyznany. Przygotowuję ofertę pracy ...', ['Najszybciej dokończysz ten proces tutaj: ', { text: EMAIL, href: `mailto:${EMAIL}` }]],
    sudo: 'Niezła próba. Ten incydent zostanie zgłoszony.',
    rm: 'Brak uprawnień. I tak się nie robi.',
    exit: 'Stąd nie ma wyjścia. Przewiń w dół.',
    coffee: ['    ( (', '     ) )', '  ........', '  |      |]', '  \\      /', "   `----'", 'Parzenie ... gotowe. Produktywność +20%.'],
    vim: 'Witaj w vimie. Stąd się nie wychodzi. Wpisz :q, żeby spróbować.',
    quit: 'Udało się uciec z vima. Osiągnięcie odblokowane.',
    flash: ['Wgrywanie firmware na /dev/ttyUSB0 ...', '[####################] 100%', 'Sprawdzanie sumy kontrolnej ... OK', 'Restart ... strona dalej działa, dobry znak.'],
    ping: 'pong (0.42 ms). Mateusz jest online.',
    hello: 'Cześć! Miło widzieć tu człowieka. Wpisz help, żeby się rozejrzeć.',
    game: 'Wygrana: terminal znaleziony. Prawdziwe 2048 jest w sekcji Portfolio.',
    date: () => new Date().toLocaleString('pl-PL'),
    echo: (a) => a || '',
  },
};

const LINKS = { github: GITHUB, linkedin: LINKEDIN };

// Komendy widoczne w `help` (w tej kolejnosci) i podpowiadane przez Tab.
export const VISIBLE = ['help', 'whoami', 'cat role.txt', 'ls ~/focus', 'ls ~/stack', 'projects', 'skills', 'contact', 'cv', 'open', 'goto', 'lang', 'clear'];

export const hint = (lang) => T[lang].hint;

// Zwraca { lines, clear?, action? }. action wykonuje komponent (pobranie, link, przewiniecie, jezyk).
export function run(input, { lang, content }) {
  const t = T[lang];
  const raw = input.trim();
  const low = raw.toLowerCase().replace(/\s+/g, ' ');
  const [cmd, ...rest] = low.split(' ');
  const arg = rest.join(' ');
  const term = Object.fromEntries(content.TERMINAL.map((l) => [l.cmd, l.out]));
  const sections = content.NAV.map(([id]) => id);

  if (!raw) return { lines: [] };
  if (term[low]) return { lines: [term[low]] };

  switch (cmd) {
    case 'help':
    case 'pomoc':
    case '?': {
      const keys = Object.keys(t.desc);
      const w = Math.max(...keys.map((k) => k.length)) + 2;
      return { lines: [t.helpHead, ...keys.map((k) => [{ text: k.padEnd(w), cls: 'k' }, t.desc[k]]), '', t.helpFoot] };
    }
    case 'projects':
    case 'projekty':
      return { lines: [t.projects, ...content.PROJECTS.map((p) => ['  ', { text: p.title, href: REPO_BASE + p.repo }, `  (${p.tag})`])] };
    case 'skills':
      return { lines: [content.SKILLS.tech, content.SKILLS.infra, content.SKILLS.ai].map((list, i) => [{ text: t.skills[i], cls: 'k' }, list.join(', ')]) };
    case 'contact':
    case 'kontakt':
      return {
        lines: [
          t.contact,
          ['  email     ', { text: EMAIL, href: `mailto:${EMAIL}` }],
          ['  github    ', { text: 'github.com/MataKomandos', href: GITHUB }],
          ...(LINKEDIN ? [['  linkedin  ', { text: LINKEDIN.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: LINKEDIN }]] : []),
        ],
      };
    case 'cv':
      return { lines: [t.cv(CV_FILE)], action: { type: 'download', href: CV_FILE } };
    case 'open': {
      const url = LINKS[arg];
      if (!url) return { lines: [t.openUsage] };
      return { lines: [t.opening(url)], action: { type: 'open', href: url } };
    }
    case 'goto':
    case 'cd': {
      const target = arg.replace(/^~\/?/, '');
      const id = sections.find((s) => s === target) || (target === 'top' || target === '' ? 'top' : null);
      if (!id) return { lines: [t.gotoUsage(sections.join('|'))] };
      return { lines: [t.goto(id)], action: { type: 'goto', id } };
    }
    case 'lang':
      if (arg !== 'en' && arg !== 'pl') return { lines: [t.langUsage] };
      return { lines: [T[arg].lang(arg)], action: { type: 'lang', lang: arg } };
    case 'clear':
    case 'cls':
      return { lines: [], clear: true };
    // ---- ukryte ----
    case 'sudo':
      return { lines: /hire|zatrudnij/.test(arg) ? t.sudoHire : [t.sudo] };
    case 'rm':
      return { lines: [t.rm] };
    case 'exit':
    case 'logout':
      return { lines: [t.exit] };
    case 'coffee':
    case 'kawa':
      return { lines: t.coffee };
    case 'vim':
    case 'vi':
    case 'nano':
      return { lines: [t.vim] };
    case ':q':
    case ':q!':
    case ':wq':
      return { lines: [t.quit] };
    case 'flash':
      return { lines: t.flash };
    case 'ping':
      return { lines: [t.ping] };
    case 'hello':
    case 'hi':
    case 'hej':
    case 'cześć':
    case 'czesc':
      return { lines: [t.hello] };
    case '2048':
      return { lines: [t.game] };
    case 'date':
      return { lines: [t.date()] };
    case 'echo':
      return { lines: [t.echo(raw.slice(5))] };
    default:
      return { lines: [t.notFound(raw.split(' ')[0])] };
  }
}

// Podpowiedz po Tab: pierwsza widoczna komenda zaczynajaca sie od wpisanego tekstu.
export function complete(input) {
  const v = input.toLowerCase();
  if (!v) return input;
  const all = [...VISIBLE, 'open github', 'open linkedin', 'lang en', 'lang pl'];
  const hit = all.find((c) => c.startsWith(v) && c !== v);
  return hit || input;
}
