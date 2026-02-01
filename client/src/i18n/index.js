// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEn from './locales/en/common.json';
import commonZh from './locales/zh/common.json';
import homeEn from './locales/en/home.json';
import homeZh from './locales/zh/home.json';
import scoringEn from './locales/en/scoring.json';
import scoringZh from './locales/zh/scoring.json';
import dreamHomeEn from './locales/en/dreamHome.json';
import dreamHomeZh from './locales/zh/dreamHome.json';
import placementEn from './locales/en/placement.json';
import placementZh from './locales/zh/placement.json';
import customizationEn from './locales/en/customization.json';
import customizationZh from './locales/zh/customization.json';

const resources = {
    en: {
        common: commonEn,
        home: homeEn,
        scoring: scoringEn,
        dreamHome: dreamHomeEn,
        placement: placementEn,
        customization: customizationEn
    },
    zh: {
        common: commonZh,
        home: homeZh,
        scoring: scoringZh,
        dreamHome: dreamHomeZh,
        placement: placementZh,
        customization: customizationZh
    }
};

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,
        fallbackLng: 'en', // Default language for Hackathon
        defaultNS: 'common',

        detection: {
            // Order of language detection
            order: ['localStorage', 'navigator'],
            // Cache user language preference
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        },

        interpolation: {
            escapeValue: false // React already escapes values
        },

        react: {
            useSuspense: false
        }
    });

export default i18n;
