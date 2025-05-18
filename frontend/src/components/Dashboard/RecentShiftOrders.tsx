import React, { useState, useEffect } from 'react';
import { useOrders, Order, OrderItem } from '@/contexts/OrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Clock, 
  Coffee, 
  AlertTriangle, 
  X, 
  Star, 
  Bell,
  Loader2,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// Define types for new functionality if not already in OrderContext
type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type ItemStatus = 'PREPARING' | 'COMPLETED' | 'CANCELLED';

// We're creating our own interfaces to avoid type conflicts with the existing ones
interface OrderItemWithStatus extends OrderItem {
  // We're using the existing status field from OrderItem
  // No need to add a new status field
}

interface EnhancedOrder extends Omit<Order, 'items'> {
  items: OrderItemWithStatus[];
  updatedAt: string;
}

// Timer component to show elapsed time
const OrderTimer = ({ createdAt }: { createdAt: string }) => {
  const [elapsedTime, setElapsedTime] = useState('');
  
  useEffect(() => {
    const orderTime = new Date(createdAt);
    
    const updateTimer = () => {
      const now = new Date();
      const diffMs = now.getTime() - orderTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setElapsedTime(`${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
    };
    
    updateTimer(); // Initial update
    const intervalId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [createdAt]);
  
  return (
    <div className="flex items-center text-muted-foreground">
      <Clock className="h-3.5 w-3.5 mr-1" />
      <span className="text-xs font-mono">{elapsedTime}</span>
    </div>
  );
};

const RecentShiftOrders = () => {
  const { orders, activeOrders, completedOrders, cancelledOrders, updateOrderStatus, fetchOrders, updateItemStatus } = useOrders();
  const [filterTab, setFilterTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add useEffect to refresh orders when triggered
  useEffect(() => {
    const refreshData = async () => {
      if (fetchOrders) {
        await fetchOrders();
      }
    };
    
    refreshData();
  }, [refreshTrigger, fetchOrders]);
  
  // Function to trigger a refresh
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const activeCount = activeOrders.length;
  const completedCount = completedOrders.length;
  const cancelledCount = cancelledOrders.length;
  
  // Filter orders based on selected tab
  const filteredOrders = filterTab === 'all' 
    ? orders 
    : filterTab === 'active'
      ? activeOrders
      : filterTab === 'completed'
        ? completedOrders
        : cancelledOrders;

  // Toggle expand/collapse for an order
  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      setIsLoading(true);
      // Use the context method instead of direct API call
      await updateOrderStatus(orderId, status);
      setIsLoading(false);
      // Trigger refresh after successful update
      triggerRefresh();
    } catch (error) {
      console.error("Error updating order status:", error);
      setIsLoading(false);
    }
  };

  // Handle importance toggle
  const handleImportanceToggle = async (orderId: string, isUrgent: boolean) => {
    try {
      setIsLoading(true);
      // Use direct API call since updateOrderPriority doesn't exist in context
      await fetch(`/api/orders/${orderId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isUrgent: !isUrgent }),
      });
      setIsLoading(false);
      // Trigger refresh after successful update
      triggerRefresh();
    } catch (error) {
      console.error("Error updating order importance:", error);
      setIsLoading(false);
    }
  };

  // Handle item status change
  const handleItemStatusChange = async (orderId: string, itemId: string, status: ItemStatus) => {
    try {
      setIsLoading(true);
      // Use the context method instead of direct API call
      await updateItemStatus(orderId, itemId, status);
      setIsLoading(false);
      // Trigger refresh after successful update
      triggerRefresh();
    } catch (error) {
      console.error("Error updating item status:", error);
      setIsLoading(false);
    }
  };

  // Render item status badge
  const renderItemStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'PREPARING':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Preparing</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-opacity-40 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
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
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {filterTab !== "all" ? filterTab.toLowerCase() : ""} orders in the last 10 hours
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {filteredOrders.map((order, index) => {
                    // Mock data for demo purposes - normally this would come from your API
                    const extendedOrder = {
                      ...order,
                      updatedAt: order.createdAt, // For demo, use createdAt as updatedAt
                      items: order.items // Use the actual items with their database status values
                    } as EnhancedOrder;
                    
                    return (
                      <div 
                        key={order.id} 
                        className="border rounded-md overflow-hidden"
                      >
                        {/* Order Header */}
                        <div 
                          className={cn(
                            "flex flex-wrap justify-between items-center p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                            order.status === 'ACTIVE' ? 'bg-blue-50 dark:bg-blue-900/10' : 
                            order.status === 'COMPLETED' ? 'bg-green-50 dark:bg-green-900/10' : 
                            'bg-red-50 dark:bg-red-900/10'
                          )}
                          onClick={() => toggleExpand(order.id)}
                        >
                          <div className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-medium text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium flex items-center flex-wrap">
                                <span className="mr-2">Order #{order.id.slice(-4)}</span>
                                {order.isUrgent && (
                                  <Badge className="mr-2 bg-red-500 text-white border-none whitespace-nowrap">
                                    <Bell className="h-3 w-3 mr-1" />
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap text-sm text-muted-foreground gap-x-2">
                                <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                                <span>•</span>
                                <span>£{order.total.toFixed(2)}</span>
                                {order.status === 'ACTIVE' && (
                                  <>
                                    <span>•</span>
                                    <OrderTimer createdAt={order.createdAt} />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
                            {/* Status Badge */}
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "whitespace-nowrap",
                                order.status === 'ACTIVE' 
                                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : order.status === 'COMPLETED'
                                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              )}
                            >
                              {order.status}
                            </Badge>
                            
                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end mt-2 sm:mt-0">
                              {order.status !== 'ACTIVE' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 sm:h-9 px-2 sm:px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(order.id, 'ACTIVE');
                                        }}
                                      >
                                        <Coffee className="h-4 w-4 mr-1 sm:mr-1.5" />
                                        <span className="sm:inline text-xs sm:text-sm">Active</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mark as Active</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              
                              {order.status !== 'COMPLETED' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 sm:h-9 px-2 sm:px-3 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(order.id, 'COMPLETED');
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-1 sm:mr-1.5" />
                                        <span className="sm:inline text-xs sm:text-sm">Done</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mark as Completed</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              
                              {order.status !== 'CANCELLED' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 sm:h-9 px-2 sm:px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(order.id, 'CANCELLED');
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-1 sm:mr-1.5" />
                                        <span className="sm:inline text-xs sm:text-sm">Cancel</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mark as Cancelled</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            
                            {/* Expand/Collapse Indicator */}
                            {expandedOrders[order.id] ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        {/* Order Details (expanded view) */}
                        {expandedOrders[order.id] && (
                          <div className="p-3 bg-background border-t">
                            {/* Additional Order Info */}
                            <div className="flex justify-between text-sm mb-3">
                              <div className="space-y-1">
                                {order.customerName && (
                                  <div>
                                    <span className="text-muted-foreground">Customer:</span> {order.customerName}
                                  </div>
                                )}
                                {order.tableNumber && (
                                  <div>
                                    <span className="text-muted-foreground">Table:</span> {order.tableNumber}
                                  </div>
                                )}
                              </div>
                              <div className="text-right space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Placed:</span> {format(new Date(order.createdAt), 'HH:mm:ss')}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Updated:</span> {formatDistanceToNow(new Date(extendedOrder.updatedAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-2" />
                            
                            {/* Order Items */}
                            <h4 className="font-medium mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {extendedOrder.items.map((item, itemIndex) => (
                                <div 
                                  key={`${order.id}-item-${itemIndex}`} 
                                  className="flex flex-wrap justify-between items-center p-2 rounded-md border bg-muted/30"
                                >
                                  <div className="flex items-center gap-2 mb-2 w-full sm:w-auto sm:mb-0">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                      {itemIndex + 1}
                                    </div>
                                    <div>
                                      <div className="font-medium">{item.menuItem.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.quantity > 1 && `${item.quantity}x `}
                                        £{item.menuItem.price.toFixed(2)}
                                        {item.notes && ` • ${item.notes}`}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {/* Item Status Badge */}
                                    {renderItemStatusBadge(item.status)}
                                    
                                    {/* Status Change Buttons */}
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          "h-7 sm:h-8 min-w-[30px] sm:min-w-[34px] px-1 sm:px-2", 
                                          item.status === 'PREPARING' 
                                            ? "bg-blue-100 text-blue-700 border-blue-300" 
                                            : "text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        )}
                                        onClick={() => handleItemStatusChange(order.id, item.id, 'PREPARING')}
                                        disabled={item.status === 'PREPARING'}
                                      >
                                        <Coffee className="h-3.5 w-3.5 mr-0.5 sm:mr-1" />
                                        <span className="text-[10px] sm:text-xs">Prep</span>
                                      </Button>
                                      
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          "h-7 sm:h-8 min-w-[30px] sm:min-w-[34px] px-1 sm:px-2", 
                                          item.status === 'COMPLETED' 
                                            ? "bg-green-100 text-green-700 border-green-300" 
                                            : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                        )}
                                        onClick={() => handleItemStatusChange(order.id, item.id, 'COMPLETED')}
                                        disabled={item.status === 'COMPLETED'}
                                      >
                                        <Check className="h-3.5 w-3.5 mr-0.5 sm:mr-1" />
                                        <span className="text-[10px] sm:text-xs">Done</span>
                                      </Button>
                                      
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          "h-7 sm:h-8 min-w-[30px] sm:min-w-[34px] px-1 sm:px-2", 
                                          item.status === 'CANCELLED' 
                                            ? "bg-red-100 text-red-700 border-red-300" 
                                            : "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        )}
                                        onClick={() => handleItemStatusChange(order.id, item.id, 'CANCELLED')}
                                        disabled={item.status === 'CANCELLED'}
                                      >
                                        <X className="h-3.5 w-3.5 mr-0.5 sm:mr-1" />
                                        <span className="text-[10px] sm:text-xs">Cancel</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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