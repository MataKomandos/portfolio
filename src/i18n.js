import { createContext, useContext } from 'react';
import { CONTENT } from './data.js';

// Jezyk: zapamietany wybor, a przy pierwszej wizycie zawsze angielski.
const KEY = 'lang';

export function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && CONTENT[saved]) return saved;
  } catch (e) { /* brak dostepu do localStorage */ }
  return 'en';
}

export function saveLang(lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch (e) { /* brak dostepu do localStorage */ }
  document.documentElement.lang = lang;
}

export const LangContext = createContext({ lang: 'en', setLang: () => {} });

// Tresc w aktualnym jezyku, np. const { PROJECTS, UI } = useT();
export function useT() {
  return CONTENT[useContext(LangContext).lang];
}

export const useLang = () => useContext(LangContext);
