import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import OrderList from '@/components/Dashboard/OrderList';
import RecentShiftOrders from '@/components/Dashboard/RecentShiftOrders';
import NewOrderForm from '@/components/Dashboard/NewOrderForm';
import CommunicationPanel from '@/components/Dashboard/CommunicationPanel';
import ScheduleCalendar from '@/components/Dashboard/ScheduleCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronUp, Mic } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [showCommunication, setShowCommunication] = useState<boolean>(false);

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
              <CardTitle>{t('dashboard.orders.dashboard')}</CardTitle>
              <CardDescription>
                Here's what's happening at Viet Baguette today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="new-order">Create Order</TabsTrigger>
                </TabsList>
                <TabsContent value="orders">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Current Shift</h3>
                    <RecentShiftOrders />
                  </div>
                </TabsContent>
                <TabsContent value="new-order">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Place New Order</h3>
                    <NewOrderForm />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div>
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center mb-4"
              onClick={() => setShowCommunication(!showCommunication)}
            >
              <span className="flex items-center">
                <Mic className="mr-2 h-5 w-5" />
                Voice Communication
              </span>
              {showCommunication ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showCommunication && <CommunicationPanel />}
          </div>
          
          <div>
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center mb-4"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <span className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                My Schedule
              </span>
              {showSchedule ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showSchedule && <ScheduleCalendar />}
          </div>

          {/* Settings Card - Removed since controls are in top navigation */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
