import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Circuit from './Circuit.jsx';
import Hero from './Hero.jsx';
import { Cursor, Header, Loader } from './chrome.jsx';
import { Contact, Education, Footer, Portfolio, Profile, Skills, Ticker } from './Sections.jsx';
import { reduceMotion } from './hooks.js';
import { LangContext, initialLang, saveLang } from './i18n.js';

function App() {
  const [booted, setBooted] = useState(reduceMotion);
  const [lang, setLangState] = useState(initialLang);
  const ctx = useMemo(() => ({
    lang,
    setLang: (l) => {
      saveLang(l);
      setLangState(l);
    },
  }), [lang]);
  document.documentElement.lang = lang;

  // key={lang}: po zmianie jezyka sekcje montuja sie od nowa, wiec animacje tekstu ruszaja z nowa trescia
  return (
    <LangContext.Provider value={ctx}>
      <Loader onDone={() => setBooted(true)} />
      <Cursor />
      <Header />
      <main key={lang}>
        <Circuit />
        <Hero go={booted} />
        <Ticker />
        <Profile />
        <Portfolio />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer key={`f-${lang}`} />
    </LangContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
