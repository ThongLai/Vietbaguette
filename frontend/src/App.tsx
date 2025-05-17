import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Menu from './pages/Menu';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar';
import Landing from './pages/Landing';

function App() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const [count, setCount] = useState(0);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mb-4">
          <button
            className={`px-4 py-2 rounded-l ${lang === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
          <button
            className={`px-4 py-2 rounded-r ${lang === 'vi' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => changeLanguage('vi')}
          >
            Tiếng Việt
          </button>
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('welcome')}</h1>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<div className='p-8 text-center'>About page coming soon...</div>} />
          <Route path="/contact" element={<div className='p-8 text-center'>Contact page coming soon...</div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
