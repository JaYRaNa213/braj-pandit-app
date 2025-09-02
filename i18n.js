import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import bn from './src/locales/bn.json';
import en from './src/locales/en.json';
import hi from './src/locales/hi.json';
import ml from './src/locales/ml.json';
import ta from './src/locales/ta.json';
import te from './src/locales/te.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  resources: {
    bn: { translation: bn },
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    ml: { translation: ml },
    te: { translation: te }

    
  },
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
