import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, Order } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import OrderList from '@/components/Dashboard/OrderList';
import NewOrderForm from '@/components/Dashboard/NewOrderForm';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  UserCheck, 
  RefreshCw 
} from 'lucide-react';

const Orders = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeOrders, completedOrders, fetchOrders, updateOrderStatus } = useOrders();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [showVIPOnly, setShowVIPOnly] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState<string>('orders');
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
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500); // Visual feedback
  };

  // Get all orders (active and completed)
  const allOrders = [...activeOrders, ...completedOrders];
  
  // Filter orders based on criteria
  const filteredOrders = allOrders.filter(order => {
    // Search filter (search by ID, customer name, or table number)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const idMatch = order.id.toLowerCase().includes(searchLower);
      const nameMatch = order.customerName?.toLowerCase().includes(searchLower) || false;
      const tableMatch = order.tableNumber?.toString().includes(searchLower) || false;
      
      if (!idMatch && !nameMatch && !tableMatch) {
        return false;
      }
    }
    
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    
    // Urgent filter
    if (showUrgentOnly && !order.isUrgent) {
      return false;
    }
    
    // VIP filter
    if (showVIPOnly && !order.isVIP) {
      return false;
    }
    
    return true;
  });
  
  const orderStatCounts = {
    pending: activeOrders.filter(o => o.status === 'PENDING').length,
    preparing: activeOrders.filter(o => o.status === 'PREPARING').length,
    completed: completedOrders.length,
    urgent: allOrders.filter(o => o.isUrgent).length,
    vip: allOrders.filter(o => o.isVIP).length,
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Order stats cards */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{orderStatCounts.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preparing</p>
              <p className="text-2xl font-bold">{orderStatCounts.preparing}</p>
            </div>
            <Package className="h-10 w-10 text-blue-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{orderStatCounts.completed}</p>
            </div>
            <Check className="h-10 w-10 text-green-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-2xl font-bold">{orderStatCounts.urgent}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">VIP</p>
              <p className="text-2xl font-bold">{orderStatCounts.vip}</p>
            </div>
            <UserCheck className="h-10 w-10 text-purple-500 opacity-80" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={showUrgentOnly ? "destructive" : "outline"} 
                onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                size="sm"
                className="flex-1"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Urgent Only
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={showVIPOnly ? "secondary" : "outline"} 
                onClick={() => setShowVIPOnly(!showVIPOnly)}
                size="sm"
                className="flex-1"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                VIP Only
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="new-order">Create Order</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders">
              <div>
                <h3 className="font-medium text-lg mb-4">Order Management</h3>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || filterStatus !== 'all' || showUrgentOnly || showVIPOnly 
                        ? "No orders match your current filters" 
                        : "There are no orders in the system yet"}
                    </p>
                    {(searchQuery || filterStatus !== 'all' || showUrgentOnly || showVIPOnly) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('');
                          setFilterStatus('all');
                          setShowUrgentOnly(false);
                          setShowVIPOnly(false);
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                    </p>
                    {/* Pass the handler function to OrderList */}
                    <OrderList 
                      searchResults={filteredOrders} 
                      useDropdownForStatus={true}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                )}
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
    </DashboardLayout>
  );
};

export default Orders; 