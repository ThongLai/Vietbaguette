import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Viet Baguette!',
      menu: 'Menu',
      login: 'Login',
      logout: 'Logout',
      // Add more keys as needed
    },
  },
  vi: {
    translation: {
      welcome: 'Chào mừng đến với Viet Baguette!',
      menu: 'Thực đơn',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      // Add more keys as needed
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 