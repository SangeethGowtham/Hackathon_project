import { createContext, useContext, useState } from 'react';
import { LANGUAGES, getTranslation } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState('en');

  // Find the full language object for the current code
  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];

  /**
   * Translate a key to the current language.
   * Usage: t('scam.heading') or t('citizen.placeholder')
   */
  const t = (key) => getTranslation(key, langCode);

  /**
   * Returns the language name used for Gemini API prompts (English name of language)
   */
  const geminiLang = currentLang.geminiName;

  return (
    <LanguageContext.Provider value={{ langCode, setLangCode, t, currentLang, geminiLang, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to consume the language context.
 * Usage: const { t, langCode, setLangCode, geminiLang, LANGUAGES } = useLanguage();
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside a <LanguageProvider>');
  return ctx;
}
