import { ReactNode, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, LogOut, Menu as MenuIcon, X, Bell, User, Calendar, Settings, Users, Package, BarChart3, Mic, MicOff, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommunication } from '@/contexts/CommunicationContext';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import ThemeSwitcher from '@/components/settings/ThemeSwitcher';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isMicActive, startVoiceCommunication, endVoiceCommunication } = useCommunication();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMic = () => {
    if (isMicActive) {
      endVoiceCommunication();
    } else {
      startVoiceCommunication();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:translate-y-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="px-4 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <img src="/image/logo.avif" alt="Logo" className="h-8 w-8" />
              <span className="font-cursive text-xl text-viet-red">Viet Baguette</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {/* User Info */}
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-2 py-3">
                  <div className="shrink-0 mr-3">
                    <div className="h-10 w-10 rounded-full bg-viet-red text-white flex items-center justify-center">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.role === 'ADMIN' ? t('admin.settings') : t('staff.orders')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Home className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {t('dashboard.orders.dashboard')}
                </Link>

                <Link
                  to="/dashboard/orders"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Package className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {t('staff.orders')}
                </Link>

                <Link
                  to="/dashboard/schedule"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Calendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {t('staff.schedule')}
                </Link>

                {/* Admin only links */}
                {isAdmin && (
                  <>
                    <Link
                      to="/dashboard/employees"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Users className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      {t('admin.employees')}
                    </Link>

                    <Link
                      to="/dashboard/menu-management"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MenuIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      {t('admin.menu')}
                    </Link>

                    <Link
                      to="/dashboard/statistics"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <BarChart3 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      {t('admin.statistics')}
                    </Link>
                  </>
                )}

                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {t('admin.settings')}
                </Link>
              </nav>
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Button 
                onClick={toggleMic}
                variant={isMicActive ? "destructive" : "outline"}
                size="sm"
                className="flex-1"
              >
                {isMicActive ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    {t('actions.cancel')}
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Push to Talk
                  </>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-xs z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 dark:text-gray-400 focus:outline-hidden lg:hidden"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('dashboard.welcome')}, {user?.name}!
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {isMicActive && (
                <div className="flex items-center">
                  <Volume2 className="mr-1 h-4 w-4 text-viet-red animate-pulse" />
                  <span className="text-sm text-viet-red font-medium">
                    Live
                  </span>
                </div>
              )}
              <ThemeSwitcher className="w-auto" />
              <LanguageSwitcher className="w-auto" />
              <Link to="/dashboard/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
