
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, Phone, Info, User, LogIn, LogOut, Settings, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeSwitcher from '@/components/Settings/ThemeSwitcher';
import LanguageSwitcher from '@/components/Settings/LanguageSwitcher';

const Navbar = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || location.pathname !== '/'
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/image/logo.avif" 
            alt="Viet Baguette Logo" 
            className="h-10 w-10" 
          />
          <span className={`font-cursive text-2xl text-viet-red transition-opacity duration-300 ${
            scrolled && location.pathname === '/' ? 'opacity-100' : location.pathname !== '/' ? 'opacity-100' : 'opacity-0 md:opacity-100'
          }`}>
            Viet Baguette
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active-nav-link' : ''}`}>
            {t('nav.home')}
          </Link>
          <Link to="/menu" className={`nav-link ${location.pathname === '/menu' ? 'active-nav-link' : ''}`}>
            {t('nav.menu')}
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active-nav-link' : ''}`}>
            {t('nav.about')}
          </Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active-nav-link' : ''}`}>
            {t('nav.contact')}
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="User Menu"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/dashboard" className="flex items-center w-full">
                    {t('nav.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('admin.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                {t('nav.login')}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitcher />
          
          {isAuthenticated && (
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-viet-orange rounded-md"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute w-full bg-white dark:bg-gray-900 shadow-md transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="px-4 py-3 space-y-4">
          <Link
            to="/"
            className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            <Home className="mr-3 h-5 w-5" />
            {t('nav.home')}
          </Link>
          <Link
            to="/menu"
            className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            <Menu className="mr-3 h-5 w-5" />
            {t('nav.menu')}
          </Link>
          <Link
            to="/about"
            className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            <Info className="mr-3 h-5 w-5" />
            {t('nav.about')}
          </Link>
          <Link
            to="/contact"
            className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            <Phone className="mr-3 h-5 w-5" />
            {t('nav.contact')}
          </Link>
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <LanguageSwitcher className="w-full" />
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  {t('admin.settings')}
                </Link>
                <button
                  className="flex w-full items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                <LogIn className="mr-3 h-5 w-5" />
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
