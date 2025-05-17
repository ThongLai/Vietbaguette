import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Menu from './pages/Menu';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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
        <nav className="space-x-4 mb-6">
          <Link to="/menu" className="text-blue-600 dark:text-blue-400">{t('menu')}</Link>
          <a href="#" className="text-blue-600 dark:text-blue-400">{t('login')}</a>
          <a href="#" className="text-blue-600 dark:text-blue-400">{t('logout')}</a>
        </nav>
        <Routes>
          <Route path="/menu" element={<Menu />} />
          <Route path="/" element={
            <>
              <div>
                <a href="https://vite.dev" target="_blank">
                  <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                  <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
              </div>
              <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                  count is {count}
                </button>
                <p>
                  Edit <code>src/App.tsx</code> and save to test HMR
                </p>
              </div>
              <p className="read-the-docs">
                Click on the Vite and React logos to learn more
              </p>
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
