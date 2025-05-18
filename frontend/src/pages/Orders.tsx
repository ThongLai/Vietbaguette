import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, Order } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import OrderList from '@/components/Dashboard/OrderList';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  Package, 
  Search, 
  Bell, 
  Filter, 
  Check, 
  Clock, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';
import { format } from 'date-fns';

const Orders = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeOrders, completedOrders, cancelledOrders, fetchOrders, updateOrderStatus } = useOrders();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  
  // UI states
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, fetchOrders]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleRefresh = async () => {
    // Prevent multiple refreshes at once
    // if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchOrders();
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast({
        title: "Error",
        description: "Failed to refresh orders",
        variant: "destructive",
      });
    } finally {
      // Always stop spinning, even if fetchOrders fails
      setIsRefreshing(false);
    }
  };

  // Get all orders (active and completed)
  const allOrders = [...activeOrders, ...completedOrders, ...cancelledOrders];
  
  // Filter orders based on criteria
  const filteredOrders = allOrders.filter(order => {
    // Search filter (search by ID, customer name, table number, item names, or order date)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const idMatch = order.id.toLowerCase().includes(searchLower);
      const nameMatch = order.customerName?.toLowerCase().includes(searchLower) || false;
      const tableMatch = order.tableNumber?.toString().includes(searchLower) || false;
      
      // Check if any item name matches the search query
      const itemNameMatch = order.items.some(item => 
        item.menuItem.name.toLowerCase().includes(searchLower)
      );
      
      // Format and check creation date
      const orderDate = new Date(order.createdAt);
      const formattedDate = format(orderDate, 'yyyy-MM-dd');
      const dateMatch = formattedDate.includes(searchLower);
      
      // Return false if none of the fields match
      if (!idMatch && !nameMatch && !tableMatch && !itemNameMatch && !dateMatch) {
        return false;
      }
    }
    
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    
    return true;
  });
  
  const orderStatCounts = {
    active: activeOrders.length,
    completed: completedOrders.length,
    cancelled: cancelledOrders.length,
    // urgent: allOrders.filter(o => o.isUrgent).length,
  };

  // Function to handle status change via dropdown
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as Order['status']);
      // Refresh orders list after status change to prevent duplicates
      await fetchOrders();
    } catch (error) {
      console.error('Error changing order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('staff.orders')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.orders.description')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="icon" className={isRefreshing ? 'animate-spin' : ''}>
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Order stats cards */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.orders.activeTab')}</p>
              <p className="text-2xl font-bold">{orderStatCounts.active}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.orders.completedTab')}</p>
              <p className="text-2xl font-bold">{orderStatCounts.completed}</p>
            </div>
            <Check className="h-10 w-10 text-green-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.orders.cancelledTab')}</p>
              <p className="text-2xl font-bold">{orderStatCounts.cancelled}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('dashboard.orders.management')}</CardTitle>
          <CardDescription>
            {t('dashboard.orders.manageDescription')}
          </CardDescription>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-medium mb-1">{t('dashboard.orders.noOrdersFound')}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== 'all'
                    ? t('dashboard.orders.noOrdersMatchFilter') 
                    : t('dashboard.orders.noOrdersYet')}
                </p>
                {(searchQuery || filterStatus !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}
                  >
                    {t('dashboard.orders.clearFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.orders.showing')} {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                </p>
                <OrderList 
                  searchResults={filteredOrders} 
                  useDropdownForStatus={true}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Orders; 