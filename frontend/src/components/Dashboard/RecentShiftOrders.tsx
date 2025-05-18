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
  ChevronUp,
  Edit,
  Trash2
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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
  const { orders, activeOrders, completedOrders, cancelledOrders, updateOrderStatus, fetchOrders, updateItemStatus, markOrderUrgent, deleteOrder } = useOrders();
  const [filterTab, setFilterTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modifyingOrder, setModifyingOrder] = useState<Order | null>(null);
  const [modifiedItems, setModifiedItems] = useState<OrderItem[]>([]);
  
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

  // Handle urgency toggle
  const handleUrgencyToggle = async (orderId: string, isUrgent: boolean) => {
    try {
      setIsLoading(true);
      await markOrderUrgent(orderId, !isUrgent);
      setIsLoading(false);
      // Trigger refresh after successful update
      triggerRefresh();
    } catch (error) {
      console.error("Error updating order urgency:", error);
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

  // Open modify dialog
  const openModifyDialog = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setModifyingOrder(order);
    setModifiedItems([...order.items]);
  };

  // Close modify dialog
  const closeModifyDialog = () => {
    setModifyingOrder(null);
    setModifiedItems([]);
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setModifiedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    setModifiedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Save modified order
  const saveModifiedOrder = async () => {
    if (!modifyingOrder) return;
    
    try {
      setIsLoading(true);
      
      // First, check if we need to remove any items
      const itemsToRemove = modifyingOrder.items.filter(
        originalItem => !modifiedItems.some(modItem => modItem.id === originalItem.id)
      );
      
      // Then, check if we need to update quantities
      const itemsToUpdate = modifiedItems.filter(modItem => {
        const originalItem = modifyingOrder.items.find(item => item.id === modItem.id);
        return originalItem && originalItem.quantity !== modItem.quantity;
      });
      
      // Process removals
      for (const item of itemsToRemove) {
        await updateItemStatus(modifyingOrder.id, item.id, 'CANCELLED');
      }
      
      // Process quantity updates
      for (const item of itemsToUpdate) {
        try {
          const token = localStorage.getItem('viet_baguette_token');
          await fetch(`/api/orders/${modifyingOrder.id}/items/${item.id}/quantity`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ quantity: item.quantity }),
          });
        } catch (error) {
          console.error(`Failed to update quantity for item ${item.id}:`, error);
        }
      }
      
      // Refresh data
      await fetchOrders();
      setIsLoading(false);
      closeModifyDialog();
    } catch (error) {
      console.error("Error updating order:", error);
      setIsLoading(false);
    }
  };

  // Handle order deletion
  const handleOrderDelete = async (orderId: string, e: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await deleteOrder(orderId);
        setIsLoading(false);
        toast.success("Order deleted successfully");
        triggerRefresh();
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Card className="shadow-sm border-opacity-40 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            New Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[300px]">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 overflow-x-auto pb-1">
              <div 
                className={`flex items-center p-2 sm:p-3 rounded-md cursor-pointer ${filterTab === "all" || filterTab === "active" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-muted/50"}`}
                onClick={() => setFilterTab("active")}
              >
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mr-1 sm:mr-2" />
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
                  <div className="text-lg sm:text-xl font-bold">{activeCount}</div>
                </div>
              </div>
              <div 
                className={`flex items-center p-2 sm:p-3 rounded-md cursor-pointer ${filterTab === "completed" ? "bg-green-50 dark:bg-green-900/20" : "bg-muted/50"}`}
                onClick={() => setFilterTab("completed")}
              >
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mr-1 sm:mr-2" />
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                  <div className="text-lg sm:text-xl font-bold">{completedCount}</div>
                </div>
              </div>
              <div 
                className={`flex items-center p-2 sm:p-3 rounded-md cursor-pointer ${filterTab === "cancelled" ? "bg-red-50 dark:bg-red-900/20" : "bg-muted/50"}`}
                onClick={() => setFilterTab("cancelled")}
              >
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 mr-1 sm:mr-2" />
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Cancelled</div>
                  <div className="text-lg sm:text-xl font-bold">{cancelledCount}</div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full" value={filterTab} onValueChange={setFilterTab}>
              <TabsList className="w-full flex overflow-x-auto scrollbar-hide snap-x p-0.5 mb-4">
                <TabsTrigger className="flex-1 min-w-[80px] snap-start" value="all">All</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[80px] snap-start" value="active">Active</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[80px] snap-start" value="completed">Completed</TabsTrigger>
                <TabsTrigger className="flex-1 min-w-[80px] snap-start" value="cancelled">Cancelled</TabsTrigger>
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
                  <ScrollArea className="h-[400px] sm:h-[400px] w-full">
                    <div className="space-y-4 min-w-[300px]">
                      {filteredOrders.map((order, index) => {
                        const extendedOrder = {
                          ...order,
                          updatedAt: order.createdAt,
                          items: order.items
                        } as EnhancedOrder;
                        
                        return (
                          <div 
                            key={order.id} 
                            className="border rounded-md overflow-hidden"
                          >
                            {/* Order Header */}
                            <div 
                              className={cn(
                                "flex flex-wrap justify-between items-center p-2 sm:p-3 hover:bg-muted/50 transition-colors cursor-pointer overflow-x-auto",
                                order.status === 'ACTIVE' ? 'bg-blue-50 dark:bg-blue-900/10' : 
                                order.status === 'COMPLETED' ? 'bg-green-50 dark:bg-green-900/10' : 
                                'bg-red-50 dark:bg-red-900/10'
                              )}
                              onClick={() => toggleExpand(order.id)}
                            >
                              <div className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto min-w-fit">
                                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground font-medium text-xs">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium flex items-center flex-nowrap">
                                    <span className="mr-2 text-sm sm:text-base">Order #{order.id.slice(-4)}</span>
                                    {order.isUrgent && (
                                      <Badge className="mr-2 bg-red-500 text-white border-none whitespace-nowrap">
                                        <Bell className="h-3 w-3 mr-1" />
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-nowrap text-xs sm:text-sm text-muted-foreground gap-x-1 sm:gap-x-2">
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
                              
                              <div className="flex items-center gap-1 sm:gap-2 flex-nowrap justify-end w-full sm:w-auto min-w-fit">
                                {/* Status Badge */}
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "whitespace-nowrap text-xs",
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
                                <div className="flex items-center gap-1 sm:gap-2 flex-nowrap justify-end mt-2 sm:mt-0 overflow-x-auto">
                                  {/* Primary Action Buttons - Always Visible */}
                                  {order.status !== 'COMPLETED' && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 sm:h-9 sm:w-auto px-0 sm:px-3 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStatusChange(order.id, 'COMPLETED');
                                            }}
                                          >
                                            <Check className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline text-xs sm:text-sm">Done</span>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Mark as Completed</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {/* Urgency Toggle Button - Keep visible */}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "h-7 w-7 sm:h-9 sm:w-auto px-0 sm:px-3", 
                                            order.isUrgent 
                                              ? "bg-amber-100 text-amber-700 border-amber-300" 
                                              : "text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUrgencyToggle(order.id, !!order.isUrgent);
                                          }}
                                        >
                                          <Bell className="h-4 w-4 sm:mr-1.5" />
                                          <span className="hidden sm:inline text-xs sm:text-sm">
                                            {order.isUrgent ? 'Not Urgent' : 'Urgent'}
                                          </span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {order.isUrgent ? 'Remove urgent flag' : 'Mark as urgent'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {/* More Actions Dropdown */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 sm:h-9 sm:w-9 px-0 sm:px-0"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">More actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {/* Status Change Options */}
                                      {order.status !== 'ACTIVE' && (
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(order.id, 'ACTIVE');
                                          }}
                                          className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                        >
                                          <Coffee className="h-4 w-4 mr-2" />
                                          <span>Mark as Active</span>
                                        </DropdownMenuItem>
                                      )}
                                      
                                      {order.status !== 'CANCELLED' && (
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(order.id, 'CANCELLED');
                                          }}
                                          className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          <span>Cancel Order</span>
                                        </DropdownMenuItem>
                                      )}
                                      
                                      <DropdownMenuSeparator />
                                      
                                      {/* Edit Option */}
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openModifyDialog(order, e);
                                        }}
                                        className="text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50"
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        <span>Modify Order</span>
                                      </DropdownMenuItem>
                                      
                                      <DropdownMenuSeparator />
                                      
                                      {/* Delete Option */}
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOrderDelete(order.id, e);
                                        }}
                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        <span>Delete Order</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
                              <div className="p-2 sm:p-3 bg-background border-t overflow-x-auto">
                                {/* Additional Order Info */}
                                <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-2 sm:mb-3">
                                  <div className="space-y-1 mb-2 sm:mb-0">
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
                                  <div className="text-left sm:text-right space-y-1">
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
                                <h4 className="font-medium mb-2 text-sm sm:text-base">Order Items</h4>
                                <div className="space-y-2">
                                  {extendedOrder.items.map((item, itemIndex) => (
                                    <div 
                                      key={`${order.id}-item-${itemIndex}`} 
                                      className="flex flex-nowrap justify-between items-center p-2 rounded-md border bg-muted/30 overflow-x-auto"
                                    >
                                      <div className="flex items-center gap-1 sm:gap-2 mb-2 w-full sm:w-auto sm:mb-0 min-w-fit">
                                        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 text-primary font-medium text-xs">
                                          {itemIndex + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium text-sm sm:text-base truncate">{item.menuItem.name}</div>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {item.quantity > 1 && `${item.quantity}x `}
                                            £{item.menuItem.price.toFixed(2)}
                                            {item.notes && ` • ${item.notes}`}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end min-w-fit">
                                        {/* Item Status Badge */}
                                        {renderItemStatusBadge(item.status)}
                                        
                                        {/* Status Change Buttons */}
                                        <div className="flex items-center gap-1 mt-2 sm:mt-0 sm:gap-2 flex-nowrap">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                              "h-7 w-7 sm:h-8 sm:w-auto min-w-0 sm:min-w-[34px] px-0 sm:px-2", 
                                              item.status === 'PREPARING' 
                                                ? "bg-blue-100 text-blue-700 border-blue-300" 
                                                : "text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleItemStatusChange(order.id, item.id, 'PREPARING');
                                            }}
                                            disabled={item.status === 'PREPARING'}
                                          >
                                            <Coffee className="h-3.5 w-3.5 sm:mr-1" />
                                            <span className="hidden sm:inline text-xs">Prep</span>
                                          </Button>
                                          
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                              "h-7 w-7 sm:h-8 sm:w-auto min-w-0 sm:min-w-[34px] px-0 sm:px-2", 
                                              item.status === 'COMPLETED' 
                                                ? "bg-green-100 text-green-700 border-green-300" 
                                                : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleItemStatusChange(order.id, item.id, 'COMPLETED');
                                            }}
                                            disabled={item.status === 'COMPLETED'}
                                          >
                                            <Check className="h-3.5 w-3.5 sm:mr-1" />
                                            <span className="hidden sm:inline text-xs">Done</span>
                                          </Button>
                                          
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                              "h-7 w-7 sm:h-8 sm:w-auto min-w-0 sm:min-w-[34px] px-0 sm:px-2", 
                                              item.status === 'CANCELLED' 
                                                ? "bg-red-100 text-red-700 border-red-300" 
                                                : "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleItemStatusChange(order.id, item.id, 'CANCELLED');
                                            }}
                                            disabled={item.status === 'CANCELLED'}
                                          >
                                            <X className="h-3.5 w-3.5 sm:mr-1" />
                                            <span className="hidden sm:inline text-xs">Cancel</span>
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
          </div>
        </CardContent>
      </Card>

      {/* Modify Order Dialog */}
      <Dialog open={!!modifyingOrder} onOpenChange={(open) => !open && closeModifyDialog()}>
        <DialogContent className="sm:max-w-[600px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Modify Order {modifyingOrder?.id.slice(-4)}</DialogTitle>
            <DialogDescription>
              Update quantities or remove items from this order.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-x-auto">
            <h3 className="font-medium mb-2">Order Items</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {modifiedItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/30 overflow-x-auto"
                >
                  <div className="flex items-start gap-2 min-w-fit">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-xs mt-1">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{item.menuItem.name}</div>
                      <div className="text-xs text-muted-foreground">
                        £{item.menuItem.price.toFixed(2)}
                        {item.notes && ` • ${item.notes}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 min-w-fit">
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-none"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <span className="sr-only">Decrease</span>
                        <span className="text-lg">-</span>
                      </Button>
                      
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="h-8 w-12 text-center border-0 focus-visible:ring-0" 
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-none"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        <span className="sr-only">Increase</span>
                        <span className="text-lg">+</span>
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeItemFromOrder(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}

              {modifiedItems.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  All items have been removed
                </div>
              )}
            </div>
            
            {modifyingOrder && (
              <div className="mt-4 text-sm text-right">
                <div className="font-medium">
                  Total: £
                  {modifiedItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeModifyDialog}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveModifiedOrder}
              disabled={isLoading || modifiedItems.length === 0}
              className="ml-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentShiftOrders; 