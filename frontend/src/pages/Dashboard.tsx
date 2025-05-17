
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import OrderList from '@/components/Dashboard/OrderList';
import CommunicationPanel from '@/components/Dashboard/CommunicationPanel';
import ScheduleCalendar from '@/components/Dashboard/ScheduleCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-viet-red"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('dashboard.welcome')}, {user.name}!</CardTitle>
              <CardDescription>
                Here's what's happening at Viet Baguette today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-medium text-lg mb-4">Order Management</h3>
                <OrderList />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <CommunicationPanel />
          <ScheduleCalendar />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
