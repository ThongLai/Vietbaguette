import { useState, useEffect } from 'react';
import { Order, useOrders } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { addHours, isAfter } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Coffee, AlertTriangle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const RecentShiftOrders = () => {
  const { activeOrders, completedOrders, cancelledOrders } = useOrders();
  const { t } = useLanguage();
  const [shiftOrders, setShiftOrders] = useState<Order[]>([]);
  const [filterTab, setFilterTab] = useState<string>("all");
  
  // Filter orders to show only those from the last 10 hours
  useEffect(() => {
    const tenHoursAgo = addHours(new Date(), -10);
    
    const recentOrders = [...activeOrders, ...completedOrders, ...cancelledOrders]
      .filter(order => isAfter(new Date(order.createdAt), tenHoursAgo))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setShiftOrders(recentOrders);
  }, [activeOrders, completedOrders, cancelledOrders]);

  // Count orders by status
  const activeCount = shiftOrders.filter(order => order.status === 'ACTIVE').length;
  const completedCount = shiftOrders.filter(order => order.status === 'COMPLETED').length;
  const cancelledCount = shiftOrders.filter(order => order.status === 'CANCELLED').length;

  // Get filtered orders based on selected tab
  const filteredOrders = filterTab === "all" 
    ? shiftOrders 
    : shiftOrders.filter(order => order.status === filterTab.toUpperCase());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          New Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div 
            className={`flex items-center p-3 rounded-md cursor-pointer ${filterTab === "all" || filterTab === "active" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-muted/50"}`}
            onClick={() => setFilterTab("active")}
          >
            <Coffee className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-xl font-bold">{activeCount}</div>
            </div>
          </div>
          <div 
            className={`flex items-center p-3 rounded-md cursor-pointer ${filterTab === "completed" ? "bg-green-50 dark:bg-green-900/20" : "bg-muted/50"}`}
            onClick={() => setFilterTab("completed")}
          >
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-xl font-bold">{completedCount}</div>
            </div>
          </div>
          <div 
            className={`flex items-center p-3 rounded-md cursor-pointer ${filterTab === "cancelled" ? "bg-red-50 dark:bg-red-900/20" : "bg-muted/50"}`}
            onClick={() => setFilterTab("cancelled")}
          >
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
              <div className="text-xl font-bold">{cancelledCount}</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" value={filterTab} onValueChange={setFilterTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={filterTab}>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {filterTab !== "all" ? filterTab.toLowerCase() : ""} orders in the last 10 hours
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">Order #{order.id.slice(-4)}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • £{order.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.isUrgent && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                        <Badge 
                          variant="outline" 
                          className={
                            order.status === 'ACTIVE' 
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : order.status === 'COMPLETED'
                                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentShiftOrders; 