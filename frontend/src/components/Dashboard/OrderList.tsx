import { useState } from 'react';
import { X, Clock, Check, AlertTriangle, UserCheck, Bell, Edit } from 'lucide-react';
import { Order, OrderItem, useOrders } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
    case 'preparing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Preparing</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
    default:
      return null;
  }
};

const ItemStatusBadge = ({ status }: { status: OrderItem['status'] }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
    case 'preparing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Preparing</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
    default:
      return null;
  }
};

const OrderCard = ({ order }: { order: Order }) => {
  const { updateOrderStatus, updateItemStatus, markOrderUrgent, markOrderVIP } = useOrders();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOrderStatusChange = (status: Order['status']) => {
    updateOrderStatus(order.id, status);
  };

  const handleItemStatusChange = (itemId: string, status: OrderItem['status']) => {
    updateItemStatus(order.id, itemId, status);
  };

  const handleToggleUrgent = () => {
    markOrderUrgent(order.id, !order.isUrgent);
  };

  const handleToggleVIP = () => {
    markOrderVIP(order.id, !order.isVIP);
  };

  return (
    <Card className={`mb-4 ${order.isUrgent ? 'border-red-500 dark:border-red-700' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              Order #{order.id.slice(-4)}
              {order.isVIP && (
                <Badge className="ml-2 bg-purple-500">VIP</Badge>
              )}
              {order.isUrgent && (
                <div className="relative ml-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Clock className="mr-1 h-3 w-3" />
              {formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}
              {order.tableNumber && (
                <span className="ml-2">• Table {order.tableNumber}</span>
              )}
              {order.customerName && (
                <span className="ml-2">• {order.customerName}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • £{order.total.toFixed(2)}
            </span>
            <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="p-0 h-auto">
              {isExpanded ? 'Hide details' : 'View details'}
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-3 mt-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        {item.quantity}x
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                      {item.options && item.options.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {item.options.map(opt => `${opt.name}: ${opt.choice}`).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm italic text-muted-foreground">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ItemStatusBadge status={item.status} />
                    <div className="ml-2 flex space-x-1">
                      {item.status !== 'completed' && (
                        <Button size="icon" variant="ghost" onClick={() => handleItemStatusChange(item.id, 'preparing')}>
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status !== 'completed' && (
                        <Button size="icon" variant="ghost" onClick={() => handleItemStatusChange(item.id, 'completed')}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {order.status !== 'cancelled' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOrderStatusChange('cancelled')}
              className="flex-1"
            >
              <X className="mr-1 h-4 w-4" />
              {t('dashboard.orders.cancel')}
            </Button>
          )}
          
          {order.status !== 'completed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOrderStatusChange('completed')}
              className="flex-1"
            >
              <Check className="mr-1 h-4 w-4" />
              {t('dashboard.orders.markDone')}
            </Button>
          )}
          
          <Button 
            variant={order.isUrgent ? "destructive" : "outline"} 
            size="sm"
            onClick={handleToggleUrgent}
            className="flex-1"
          >
            <AlertTriangle className="mr-1 h-4 w-4" />
            {t('dashboard.orders.urgent')}
          </Button>
          
          <Button 
            variant={order.isVIP ? "secondary" : "outline"} 
            size="sm"
            onClick={handleToggleVIP}
            className="flex-1"
          >
            <UserCheck className="mr-1 h-4 w-4" />
            VIP
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
          >
            <Edit className="mr-1 h-4 w-4" />
            {t('dashboard.orders.modify')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderList = () => {
  const { activeOrders, completedOrders } = useOrders();
  const { t } = useLanguage();

  const pendingOrders = activeOrders.filter(order => order.status === 'pending');
  const preparingOrders = activeOrders.filter(order => order.status === 'preparing');
  
  return (
    <div>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="active">
            {t('dashboard.orders.active')} ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('dashboard.orders.completed')} ({completedOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active orders</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-240px)] pr-4">
              {pendingOrders.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">Pending</h2>
                  {pendingOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
              
              {preparingOrders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Preparing</h2>
                  {preparingOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {completedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed orders yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-240px)] pr-4">
              {completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderList;
