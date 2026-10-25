// Cala tresc strony w jednym miejscu. Zmieniasz tekst tutaj, a nie w komponentach.
// Kazdy tekst jest w dwoch wersjach: CONTENT.en i CONTENT.pl.
// Fragmenty w `backtickach` sa wyswietlane jako kod.

export const GITHUB = 'https://github.com/MataKomandos?tab=repositories';
export const REPO_BASE = 'https://github.com/MataKomandos/';
// Wklej tu link do profilu, np. 'https://www.linkedin.com/in/twoj-profil/'. Pusty = wiersz sie nie pokazuje.
export const LINKEDIN = 'https://www.linkedin.com/in/mateusz-sobczak-02a949371/';
// Plik lezy w public/ i build kopiuje go do dist/.
export const CV_FILE = 'Mateusz_Sobczak_CV.pdf';
export const EMAIL = 'matsobczak05@gmail.com';
// Formularz kontaktowy wysyla przez FormSubmit (bez konta). Pierwsza wiadomosc przychodzi z linkiem aktywacyjnym.
// Po aktywacji FormSubmit podaje losowy alias: wpisz go zamiast adresu, zeby e-mail nie byl widoczny w kodzie.
export const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;

// Zrzut ekranu projektu: wrzuc plik do public/ i wpisz jego nazwe w `image` przy projekcie.
// Bez `image` karta pokazuje ilustracje z Previews.jsx.
const REPOS = {
  db: 'System-zarz-dzania-firma-budowlana',
  stock: 'symulator_gieldy',
  routes: 'System-rekomendacji-tras-turystycznych',
  game: '2048',
};

const en = {
  NAV: [
    ['profile', 'Profile'],
    ['portfolio', 'Portfolio'],
    ['skills', 'Skills'],
    ['education', 'Education'],
    ['contact', 'Contact'],
  ],
  TICKER_A: ['Java', 'C/C++', 'Python', 'SQL', 'PostgreSQL', 'Linux', 'Git', 'Jenkins', 'CI/CD', 'QA'],
  TICKER_B: ['Firmware validation', 'Web applications', 'Databases', 'Clean code', 'Data security', 'Test infrastructure'],
  PROFILE_TEXT:
    'Computer Science student specializing in web applications and databases, and a Technical School of Information Technology graduate. ' +
    'I have practical experience in executing IT projects involving programming, database management, and modular application architecture. ' +
    'I focus on writing clean code while ensuring system stability and data security.',
  PROFILE_NOTE: 'Currently seeking opportunities for professional growth and development.',
  TERMINAL: [
    { cmd: 'whoami', out: 'Computer Science student, University of Gdańsk (year 3)' },
    { cmd: 'cat role.txt', out: 'Firmware Validation Engineer @ SII, since 05.2026' },
    { cmd: 'ls ~/focus', out: 'web-applications  databases  modular-architecture  clean-code  stability  data-security' },
    { cmd: 'ls ~/stack', out: 'java  c/c++  python  sql  postgresql  linux  git  jenkins' },
  ],
  STAGES: [
    { title: 'Test infrastructure', text: 'Maintaining the infrastructure used for firmware validation.' },
    { title: 'Networking', text: 'Configuring and troubleshooting networks in test setups.' },
    { title: 'Hardware testing', text: 'Running firmware tests on target platforms and devices.' },
    { title: 'Debugging', text: 'Diagnosing hardware and firmware issues, analyzing logs.' },
  ],
  PROJECTS: [
    {
      preview: 'db',
      tag: 'SQL / PostgreSQL',
      title: 'Construction Company Management System',
      summary: 'A PostgreSQL database for a construction firm that enforces its own business rules, with tests that prove it.',
      chips: ['12 tables', 'PL/pgSQL', 'triggers', 'transactions'],
      bullets: [
        'Normalized 12-table schema covering clients, projects, stages, employees, tasks, materials, suppliers, deliveries, equipment rentals and payments, with an ERD in DBML and a written design report.',
        'Triggers reject any delivery that would push a project over budget, keep historical prices intact when the price list changes, and close a project automatically when its last stage reaches 100%.',
        'An `EXCLUDE` constraint makes it impossible to rent one machine to two projects at once. Row locks keep two simultaneous deliveries from jointly breaking a budget.',
        'Five reporting views, a materialized cost report with a nightly refresh, 13 rule tests and a two-session concurrency test.',
      ],
      repo: REPOS.db,
    },
    {
      preview: 'stock',
      tag: 'Java',
      title: 'Stock market simulator',
      summary: 'A portfolio engine where each asset type knows what it really costs to own.',
      chips: ['OOP', 'polymorphism', 'JUnit 5'],
      bullets: [
        'Abstract `Asset` with three market-specific subclasses: shares carry a flat 5.00 purchase fee, commodities lose value to storage costs that grow with position size, and currencies are valued at the bid price after the spread.',
        '`Portfolio` prices purchases and calculates net worth through polymorphic calls only, with no `instanceof` and no type checks.',
        'Purchases are validated before any cash moves: insufficient funds throw, zero quantities are ignored, and repeat buys of one symbol merge into a single holding.',
        '25 unit tests pin down the fee, storage and spread formulas and the edge cases around them. A runnable demo prints a sample portfolio.',
      ],
      repo: REPOS.stock,
    },
    {
      preview: 'routes',
      tag: 'Python',
      title: 'Tourist route recommender',
      summary: 'Ranks hiking routes for a chosen day from your preferences and the weather, then writes a PDF report.',
      chips: ['BeautifulSoup', 'TextBlob', 'ReportLab', 'pytest'],
      bullets: [
        'Filters 15 routes across 10 Polish mountain regions by length and difficulty, then ranks the rest by a weighted mix of route fit and weather fit for the day you pick.',
        'Weather comes from CSV data and saved route pages are parsed for distance, duration, elevation, map markers and reviews. Review text is analyzed for sentiment and the aspects mentioned most often.',
        'The PDF report collects elevation profiles, comparison charts, seasonality heatmaps, a summary table and an appendix, with Polish characters rendering on any system.',
        '10 pytest tests cover the comfort index, filtering, ranking and rating logic.',
      ],
      repo: REPOS.routes,
    },
    {
      preview: 'game',
      tag: 'Python',
      title: 'Game 2048',
      summary: 'A terminal 2048 with six game modes, a hint engine and a database behind every game.',
      chips: ['pytest', 'SQLite', 'matplotlib'],
      bullets: [
        'Classic, AI-assisted, timed, obstacle, challenge and two-player modes, on boards from 3×3 to 6×6 with a target of 1024, 2048 or 4096.',
        'The hint engine plays each move on a copy of the board and scores it on merges, tile ordering, free cells and big tiles held in corners. Hints are limited by difficulty.',
        'Saves carry a SHA-256 checksum, so a corrupted file is detected on load. Autosave, quick-save slots, named checkpoints, JSON export and import, and undo are built in.',
        'Players, games and every move are stored in SQLite and feed a statistics screen with progress charts and an achievements system. A pytest suite covers moves, scoring, saves, undo and the database.',
      ],
      repo: REPOS.game,
    },
  ],
  SKILLS: {
    tech: ['Java', 'C/C++', 'Python', 'Flask', 'Django', 'OOP', 'JUnit 5', 'SQL', 'PostgreSQL', 'MySQL', 'SQLite', '.NET'],
    infra: ['Git', 'Windows Server', 'Linux', 'Bash', 'CCNA', 'HTTP/HTTPS', 'Jenkins', 'Jira', 'QA', 'CI/CD'],
    ai: ['Cursor', 'Gemini', 'ChatGPT', 'Copilot', 'Claude'],
  },
  LANGUAGES: [
    { name: 'Polish', level: 'native', bars: 6 },
    { name: 'English', level: 'B2', bars: 4 },
    { name: 'German', level: 'A1', bars: 1 },
  ],
  EDUCATION: [
    { place: 'University of Gdańsk', what: 'Computer Science, 3rd year student' },
    { place: 'Zespół Szkół Technicznych in Grudziądz', what: 'IT Technician title' },
  ],
  CERTIFICATES: [
    { date: '03.2024', name: 'INF.03' },
    { date: '08.2022', name: 'INF.02' },
    { date: '03.2022', name: 'CCNAv7' },
    { date: '06.2020', name: 'IT Essentials' },
  ],
  UI: {
    role: 'Firmware Validation Engineer @ SII',
    lead: ['Computer Science student specializing in ', 'web applications', ' and ', 'databases', '.'],
    viewPortfolio: 'View portfolio',
    contact: 'Contact',
    cv: 'Download CV',
    hud: ['LOCAL', 'PORTFOLIO 2026', 'SCROLL TO DIVE'],
    profile: 'Profile',
    portfolio: 'Portfolio',
    skills: 'Skills',
    education: 'Education',
    certificates: 'Certificates',
    currentRole: 'Current role, since 05.2026',
    viewRepo: 'View repository',
    allRepos: 'All repositories on GitHub',
    techData: 'Technology and data',
    infra: 'Infrastructure',
    ai: 'AI tools',
    langs: 'Languages',
    mega: "Let's build something.",
    email: 'Email',
    cvRow: 'CV',
    cvFile: 'Mateusz_Sobczak_CV.pdf',
    copy: 'Copy',
    copied: 'Copied',
    selected: 'Selected',
    copyManual: 'Copy manually',
    open: 'Open',
    download: 'Download',
    openToWork: 'Open to work',
    backToTop: 'Back to top',
    skip: 'Click to skip',
    loading: 'Loading portfolio',
    sections: 'Sections',
    intro: 'Introduction',
    switchLang: 'Przełącz na polski',
    termInput: 'Terminal command',
    form: {
      title: 'Send a message',
      name: 'Name',
      email: 'Your email',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending ...',
      sent: 'Message sent. I will get back to you soon.',
      error: 'Could not send the message. Please email me directly:',
      subject: 'New message from your portfolio',
    },
    previewAlt: (title) => `Screenshot of ${title}`,
  },
};

const pl = {
  NAV: [
    ['profile', 'Profil'],
    ['portfolio', 'Portfolio'],
    ['skills', 'Umiejętności'],
    ['education', 'Edukacja'],
    ['contact', 'Kontakt'],
  ],
  TICKER_A: en.TICKER_A,
  TICKER_B: ['Walidacja firmware', 'Aplikacje webowe', 'Bazy danych', 'Czysty kod', 'Bezpieczeństwo danych', 'Infrastruktura testowa'],
  PROFILE_TEXT:
    'Studiuję informatykę i specjalizuję się w aplikacjach webowych oraz bazach danych. Mam za sobą technikum informatyczne. ' +
    'Mam praktyczne doświadczenie w realizacji projektów IT obejmujących programowanie, zarządzanie bazami danych i modułową architekturę aplikacji. ' +
    'Stawiam na czysty kod, stabilność systemu i bezpieczeństwo danych.',
  PROFILE_NOTE: 'Szukam możliwości dalszego rozwoju zawodowego.',
  TERMINAL: [
    { cmd: 'whoami', out: 'Informatyka, Uniwersytet Gdański (3. rok)' },
    { cmd: 'cat role.txt', out: 'Firmware Validation Engineer @ SII, od 05.2026' },
    { cmd: 'ls ~/focus', out: 'aplikacje-webowe  bazy-danych  architektura-modulowa  czysty-kod  stabilnosc  bezpieczenstwo-danych' },
    { cmd: 'ls ~/stack', out: en.TERMINAL[3].out },
  ],
  STAGES: [
    { title: 'Infrastruktura testowa', text: 'Utrzymanie infrastruktury używanej do walidacji firmware.' },
    { title: 'Sieci', text: 'Konfiguracja i diagnozowanie sieci w stanowiskach testowych.' },
    { title: 'Testy sprzętu', text: 'Uruchamianie testów firmware na docelowych platformach i urządzeniach.' },
    { title: 'Debugowanie', text: 'Diagnozowanie problemów sprzętu i firmware, analiza logów.' },
  ],
  PROJECTS: [
    {
      ...en.PROJECTS[0],
      title: 'System zarządzania firmą budowlaną',
      summary: 'Baza PostgreSQL dla firmy budowlanej, która sama pilnuje reguł biznesowych, z testami, które to potwierdzają.',
      chips: ['12 tabel', 'PL/pgSQL', 'triggery', 'transakcje'],
      bullets: [
        'Znormalizowany schemat z 12 tabel: klienci, projekty, etapy, pracownicy, zadania, materiały, dostawcy, dostawy, wynajem sprzętu i płatności, z diagramem ERD w DBML i opisem projektu.',
        'Triggery odrzucają dostawę, która przekroczyłaby budżet projektu, chronią historyczne ceny przy zmianie cennika i automatycznie zamykają projekt, gdy ostatni etap osiągnie 100%.',
        'Ograniczenie `EXCLUDE` uniemożliwia wynajęcie jednej maszyny dwóm projektom naraz. Blokady wierszy nie pozwalają, by dwie równoczesne dostawy razem przekroczyły budżet.',
        'Pięć widoków raportowych, zmaterializowany raport kosztów odświeżany co noc, 13 testów reguł i test współbieżności na dwóch sesjach.',
      ],
    },
    {
      ...en.PROJECTS[1],
      title: 'Symulator giełdy',
      summary: 'Silnik portfela, w którym każdy typ aktywa wie, ile naprawdę kosztuje jego posiadanie.',
      chips: ['OOP', 'polimorfizm', 'JUnit 5'],
      bullets: [
        'Abstrakcyjna klasa `Asset` z trzema podklasami: akcje mają stałą opłatę 5.00 za zakup, surowce tracą na wartości przez koszt magazynowania rosnący z wielkością pozycji, a waluty są wyceniane po cenie kupna po spreadzie.',
        '`Portfolio` wycenia zakupy i liczy wartość portfela wyłącznie przez wywołania polimorficzne, bez `instanceof` i bez sprawdzania typów.',
        'Zakup jest walidowany, zanim ruszą pieniądze: brak środków rzuca wyjątek, zerowe ilości są pomijane, a kolejne zakupy tego samego symbolu łączą się w jedną pozycję.',
        '25 testów jednostkowych sprawdza wzory na opłaty, magazynowanie i spread oraz przypadki brzegowe. Dołączone demo wypisuje przykładowy portfel.',
      ],
    },
    {
      ...en.PROJECTS[2],
      title: 'Rekomendacja tras turystycznych',
      summary: 'Układa ranking tras górskich na wybrany dzień według preferencji i pogody, a potem generuje raport PDF.',
      bullets: [
        'Filtruje 15 tras z 10 polskich pasm górskich według długości i trudności, a resztę ustawia w rankingu według ważonego dopasowania trasy i pogody na wybrany dzień.',
        'Pogoda pochodzi z plików CSV, a z zapisanych stron tras wyciągane są dystans, czas, przewyższenie, punkty na mapie i opinie. Tekst opinii jest analizowany pod kątem wydźwięku i najczęściej wymienianych cech.',
        'Raport PDF zawiera profile wysokości, wykresy porównawcze, mapy cieplne sezonowości, tabelę podsumowującą i aneks, a polskie znaki wyświetlają się na każdym systemie.',
        '10 testów pytest obejmuje indeks komfortu, filtrowanie, ranking i ocenianie.',
      ],
    },
    {
      ...en.PROJECTS[3],
      title: 'Gra 2048',
      summary: 'Terminalowe 2048 z sześcioma trybami gry, silnikiem podpowiedzi i bazą danych pod każdą rozgrywką.',
      bullets: [
        'Tryby: klasyczny, z pomocą AI, na czas, z przeszkodami, wyzwania i dla dwóch graczy, na planszach od 3×3 do 6×6 z celem 1024, 2048 lub 4096.',
        'Silnik podpowiedzi rozgrywa każdy ruch na kopii planszy i ocenia go według połączeń, ułożenia płytek, wolnych pól i dużych płytek w rogach. Liczba podpowiedzi zależy od poziomu trudności.',
        'Zapisy mają sumę kontrolną SHA-256, więc uszkodzony plik zostaje wykryty przy wczytaniu. Jest autozapis, sloty szybkiego zapisu, nazwane punkty kontrolne, eksport i import JSON oraz cofanie ruchów.',
        'Gracze, gry i każdy ruch trafiają do SQLite i zasilają ekran statystyk z wykresami postępów i systemem osiągnięć. Testy pytest obejmują ruchy, punktację, zapisy, cofanie i bazę danych.',
      ],
    },
  ],
  SKILLS: en.SKILLS,
  LANGUAGES: [
    { name: 'Polski', level: 'ojczysty', bars: 6 },
    { name: 'Angielski', level: 'B2', bars: 4 },
    { name: 'Niemiecki', level: 'A1', bars: 1 },
  ],
  EDUCATION: [
    { place: 'Uniwersytet Gdański', what: 'Informatyka, 3. rok studiów' },
    { place: 'Zespół Szkół Technicznych w Grudziądzu', what: 'Tytuł technika informatyka' },
  ],
  CERTIFICATES: en.CERTIFICATES,
  UI: {
    ...en.UI,
    lead: ['Studiuję informatykę i specjalizuję się w ', 'aplikacjach webowych', ' oraz ', 'bazach danych', '.'],
    viewPortfolio: 'Zobacz portfolio',
    contact: 'Kontakt',
    cv: 'Pobierz CV',
    hud: ['CZAS', 'PORTFOLIO 2026', 'PRZEWIŃ W DÓŁ'],
    profile: 'Profil',
    skills: 'Umiejętności',
    education: 'Edukacja',
    certificates: 'Certyfikaty',
    currentRole: 'Obecne stanowisko, od 05.2026',
    viewRepo: 'Zobacz repozytorium',
    allRepos: 'Wszystkie repozytoria na GitHubie',
    techData: 'Technologie i dane',
    infra: 'Infrastruktura',
    ai: 'Narzędzia AI',
    langs: 'Języki',
    mega: 'Zbudujmy coś razem.',
    cvFile: 'Mateusz_Sobczak_CV.pdf (EN)',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    selected: 'Zaznaczono',
    copyManual: 'Skopiuj ręcznie',
    open: 'Otwórz',
    download: 'Pobierz',
    openToWork: 'Szukam pracy',
    backToTop: 'Na górę',
    skip: 'Kliknij, aby pominąć',
    loading: 'Ładowanie portfolio',
    sections: 'Sekcje',
    intro: 'Wstęp',
    switchLang: 'Switch to English',
    termInput: 'Komenda terminala',
    form: {
      title: 'Napisz wiadomość',
      name: 'Imię',
      email: 'Twój e-mail',
      message: 'Wiadomość',
      send: 'Wyślij wiadomość',
      sending: 'Wysyłanie ...',
      sent: 'Wiadomość wysłana. Odezwę się wkrótce.',
      error: 'Nie udało się wysłać wiadomości. Napisz bezpośrednio:',
      subject: 'Nowa wiadomość z portfolio',
    },
    previewAlt: (title) => `Zrzut ekranu: ${title}`,
  },
};

export const CONTENT = { en, pl };
