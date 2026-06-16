import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { de } from './locales/de';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { rm } from './locales/rm';
import type { Dictionary, Language } from './types';

const dictionaries: Record<Language, Dictionary> = { en, it, de, fr, rm };

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'isochrone_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Check local storage
    const stored = localStorage.getItem(STORAGE_KEY) as Language;
    if (stored && dictionaries[stored]) return stored;

    // 2. Check browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (dictionaries[browserLang]) return browserLang;

    // 3. Default to English
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  // Update HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: dictionaries[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
