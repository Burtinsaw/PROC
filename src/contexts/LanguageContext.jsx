import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { SUPPORTED_LANGS, DICT } from './languageDictionary';

const LanguageContext = createContext({
  lang: 'tr',
  setLang: () => {},
  t: (k) => k
});

function translate(lang, key){
  return DICT[key]?.[lang] || DICT[key]?.tr || key;
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('tr');

  useEffect(()=>{
    try {
      const saved = localStorage.getItem('uiLang');
      if(saved && SUPPORTED_LANGS.includes(saved)) setLang(saved);
    } catch {/* ignore */}
  }, []);

  const change = (l) => {
    if(!SUPPORTED_LANGS.includes(l)) return;
    setLang(l);
    try { localStorage.setItem('uiLang', l); } catch {/* ignore */}
  };

  const value = useMemo(()=>({
    lang,
    setLang: change,
    t: (k) => translate(lang, k)
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
