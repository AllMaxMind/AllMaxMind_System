import React from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME } from '../../constants';
import { Mail, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation('landing');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ds-border bg-ds-bg py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Logo + Description */}
          <div className="space-y-4">
            <div className="font-display font-black text-xl">
              <span className="text-white">{APP_NAME.split(' ')[0]}</span>
              <span className="bg-clip-text text-transparent bg-ds-gradient-primary ml-1">
                {APP_NAME.split(' ').slice(1).join(' ')}
              </span>
            </div>
            <p className="text-ds-text-tertiary text-sm leading-relaxed max-w-xs">
              {t('footer.description', 'AI-powered solutions to transform operational chaos into smart, automated workflows.')}
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-ds-text-primary">
              {t('footer.links', 'Links')}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-ds-text-tertiary hover:text-ds-primary-400 transition-colors text-sm"
                >
                  {t('footer.privacy', 'Privacy Policy')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-ds-text-tertiary hover:text-ds-primary-400 transition-colors text-sm"
                >
                  {t('footer.terms', 'Terms of Service')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-ds-text-tertiary hover:text-ds-primary-400 transition-colors text-sm"
                >
                  {t('footer.contact', 'Contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Social/Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-ds-text-primary">
              {t('footer.connect', 'Connect')}
            </h4>
            <div className="flex gap-4">
              <a
                href="mailto:contact@allmaxmind.com"
                className="p-2 bg-ds-surface rounded-lg border border-ds-border hover:border-ds-primary-500/50 hover:bg-ds-card transition-all group"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-ds-text-tertiary group-hover:text-ds-primary-400 transition-colors" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-ds-surface rounded-lg border border-ds-border hover:border-ds-primary-500/50 hover:bg-ds-card transition-all group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-ds-text-tertiary group-hover:text-ds-primary-400 transition-colors" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-ds-surface rounded-lg border border-ds-border hover:border-ds-primary-500/50 hover:bg-ds-card transition-all group"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-ds-text-tertiary group-hover:text-ds-primary-400 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-ds-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-ds-text-tertiary text-xs">
            <p>
              &copy; {currentYear} {APP_NAME}. {t('footer.rights', 'All rights reserved.')}
            </p>
            <p className="text-ds-text-tertiary/50">
              {t('footer.madeWith', 'Made with AI-driven intelligence')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
