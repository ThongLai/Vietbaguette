import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import enTranslations from '../i18n/en.json';
import viTranslations from '../i18n/vi.json';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: enTranslations,
  vi: viTranslations
};

// Helper function to get nested object value by dot notation key
const getNestedValue = (obj: any, key: string): string => {
  const keys = key.split('.');
  let result = obj;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return the key if path doesn't exist
    }
  }
  
  return result && typeof result === 'string' ? result : key;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('viet_baguette_lang') as Language;
    return savedLanguage || 'en';
  });

  const t = (key: string): string => {
    return getNestedValue(translations[language], key) || key;
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('viet_baguette_lang', newLanguage);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleLanguageChange, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
