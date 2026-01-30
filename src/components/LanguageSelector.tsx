import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = [
    { code: 'en-US', label: 'EN', flag: '🇺🇸' },
    { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={clsx(
            'px-3 py-1 rounded font-medium transition-colors',
            i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          )}
          title={`${lang.flag} Switch to ${lang.label}`}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  );
}
