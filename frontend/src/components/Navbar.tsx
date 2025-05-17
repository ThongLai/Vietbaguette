import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/contact', label: 'Contact' },
];

function ThemeSwitcher() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex items-center space-x-1 ml-4">
      <button
        className={`px-2 py-1 rounded ${theme === 'light' ? 'bg-primary text-accent' : 'bg-gray-200 dark:bg-gray-700'}`}
        onClick={() => setTheme('light')}
      >Light</button>
      <button
        className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-primary text-accent' : 'bg-gray-200 dark:bg-gray-700'}`}
        onClick={() => setTheme('dark')}
      >Dark</button>
      <button
        className={`px-2 py-1 rounded ${theme === 'system' ? 'bg-primary text-accent' : 'bg-gray-200 dark:bg-gray-700'}`}
        onClick={() => setTheme('system')}
      >System</button>
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-cream dark:bg-gray-900 shadow">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Viet Baguette Logo" className="h-10 w-10 rounded-full shadow" />
        <span className="font-script text-2xl text-accent">Viet Baguette</span>
      </div>
      <div className="flex items-center space-x-2">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1 rounded font-semibold transition-colors ${location.pathname === link.to ? 'bg-primary text-accent' : 'text-accent dark:text-white hover:bg-primary/80'}`}
          >
            {link.label}
          </Link>
        ))}
        <ThemeSwitcher />
      </div>
    </nav>
  );
} 