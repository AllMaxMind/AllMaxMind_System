import React, { useState, useEffect } from 'react';
import { Lightbulb, LogOut, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_NAME } from '../../constants';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { useAuth } from '../../src/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { t } = useTranslation('landing');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, userRole, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.company', 'Company'), href: '#company' },
    { label: t('nav.solutions', 'Solutions'), href: '#solutions' },
    { label: t('nav.howItWorks', 'How it Works'), href: '#how-it-works' },
  ];

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-ds-bg/80 backdrop-blur-md border-b border-ds-border shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-ds-primary-500" />
          <span className="text-xl font-bold tracking-wide text-white">
            {APP_NAME.toUpperCase()}
          </span>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-ds-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side - Language Selector + User Menu / Sign Up */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector />

          {/* User Menu (when authenticated) */}
          {user && !loading && (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => window.location.hash = '/admin'}
                  className="px-3 py-2 rounded-lg flex items-center gap-2 bg-ds-primary-500/10 border border-ds-primary-500/30 text-ds-primary-400 hover:bg-ds-primary-500/20 transition-colors text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  Admin
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-3 py-2 rounded-lg bg-ds-surface/50 border border-slate-600 text-white hover:border-ds-primary-500 transition-colors text-sm"
                >
                  {user.email?.split('@')[0]}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-ds-card border border-ds-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-ds-text-secondary hover:text-white hover:bg-ds-surface transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign Up Button (when not authenticated) */}
          {!user && !loading && (
            <button className="px-5 py-2 rounded-full border border-slate-600 text-white hover:border-ds-primary-500 hover:text-ds-accent transition-colors text-sm font-medium bg-ds-surface/50">
              {t('nav.signUp', 'Sign Up')}
            </button>
          )}
        </div>

        {/* Mobile - Just Language Selector */}
        <div className="md:hidden">
          <LanguageSelector />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
