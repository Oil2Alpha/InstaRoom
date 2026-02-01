// src/i18n/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language || 'en';

    return (
        <div className="language-switcher">
            <button
                className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                aria-label="Switch to English"
            >
                EN
            </button>
            <button
                className={`lang-btn ${currentLanguage === 'zh' ? 'active' : ''}`}
                onClick={() => changeLanguage('zh')}
                aria-label="切换到中文"
            >
                中
            </button>
        </div>
    );
};

export default LanguageSwitcher;
