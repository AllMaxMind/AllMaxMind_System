import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const languages = [
  { code: 'en-US', label: 'EN', fullLabel: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', label: 'PT', fullLabel: 'Português', flag: '🇧🇷' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current language from i18n (single source of truth)
  const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[1];

  const changeLanguage = async (lng: string) => {
    // Save to localStorage first
    localStorage.setItem('language', lng);

    // Change language in i18n (this triggers re-render via react-i18next)
    await i18n.changeLanguage(lng);

    // Close dropdown
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Shows only current language */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200',
          'bg-ds-surface/50 border border-ds-border/50 hover:border-ds-primary-500/50',
          'text-ds-text-secondary hover:text-ds-text-primary',
          isOpen && 'border-ds-primary-500/50 bg-ds-surface'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 py-1 w-40 bg-ds-surface border border-ds-border rounded-lg shadow-xl shadow-black/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                i18n.language === lang.code
                  ? 'bg-ds-primary-500/10 text-ds-primary-400'
                  : 'text-ds-text-secondary hover:bg-ds-card hover:text-ds-text-primary'
              )}
              role="option"
              aria-selected={i18n.language === lang.code}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.fullLabel}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto text-ds-primary-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
