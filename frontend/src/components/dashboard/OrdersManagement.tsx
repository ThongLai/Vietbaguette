import { useState, useEffect } from 'react';
import { X, Clock, Check, AlertTriangle, Edit, Trash, Plus, Minus, RefreshCw } from 'lucide-react';
import { Order, OrderItem, useOrders } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

// Main component for recent shift orders
const RecentShiftOrders = () => {
    const { recentOrders, updateOrderStatus, markOrderUrgent, updateItemStatus, loadRecentOrders, setRecentOrders, deleteOrder } = useOrders();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('active');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for animations
    const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);

    // Function to load recent orders and update UI state
    const fetchRecentOrders = async () => {
      setIsLoading(true);
      try {
          // Call the loadRecentOrders function from context
          await loadRecentOrders();
          // Increment refresh key to trigger animations
          setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error loading recent orders:', error);
        toast({
          title: "Failed to load orders",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      // Check if orders already exist (page was not reloaded)
      if (!hasInitialDataLoaded) {
        fetchRecentOrders().then(() => {
          setHasInitialDataLoaded(true);
        });
      }
      
      // Set up polling for order updates every 30 seconds
      const intervalId = setInterval(fetchRecentOrders, 30000);
      
      return () => clearInterval(intervalId);
    }, [hasInitialDataLoaded, recentOrders.length]);
  
  
    
    // Handle order status changes - immediately update UI state
    const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
      // Find the order to update
      const orderToUpdate = recentOrders.find(order => order.id === orderId);
      if (!orderToUpdate) return;
      
      // Update local state immediately for responsive UI
      const updatedOrders = recentOrders.map(order => 
        order.id === orderId ? {...order, status: newStatus} : order
      );
      setRecentOrders(updatedOrders);
      
      // If the selected order is the one being updated, reset it to avoid blank dialog
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
        setIsModifyDialogOpen(false);
      }
      
      // Call API in background without waiting
      updateOrderStatus(orderId, newStatus).catch(error => {
        console.error('Error updating order status:', error);
        toast({
          title: "Failed to update order status",
          description: "Please try again",
          variant: "destructive",
        });
      });
    };
    
    // Handle item status changes
    const handleItemStatusChange = (orderId: string, itemId: string, status: OrderItem['status']) => {
      updateItemStatus(orderId, itemId, status);
    };
    
    // Handle opening modify dialog
    const handleModifyOrder = (order: Order) => {
      // Make sure we have the latest version of the order
      const latestOrder = recentOrders.find(o => o.id === order.id);
      setSelectedOrder(latestOrder || order);
      setIsModifyDialogOpen(true);
    };
    
    // Handle saving modified order with immediate UI update
    const handleSaveModifiedOrder = async (modifiedOrder: Order): Promise<void> => {
      // Immediately update the local state for responsive UI
      setRecentOrders(prevOrders => 
        prevOrders.map(order => order.id === modifiedOrder.id ? modifiedOrder : order)
      );
      
      // Close the dialog and reset selected order
      setIsModifyDialogOpen(false);
      setSelectedOrder(null);
      
      // Show success toast
      // toast({
      //   description: `Order #${modifiedOrder.id.slice(-4)} updated successfully`,
      //   duration: 3000,
      // });
      
      // Handle API calls in background without blocking UI
      try {
        const promises = [];
        
        // Update order status if changed
        if (modifiedOrder.status !== selectedOrder?.status) {
          promises.push(updateOrderStatus(modifiedOrder.id, modifiedOrder.status));
        }
        
        // Update urgent flag if changed
        if (modifiedOrder.isUrgent !== selectedOrder?.isUrgent) {
          promises.push(markOrderUrgent(modifiedOrder.id, modifiedOrder.isUrgent || false));
        }
        
        // Wait for all promises to resolve
        await Promise.all(promises);
      } catch (error) {
        console.error('Error updating order:', error);
        toast({
          title: "Update error",
          description: "Changes might not have been saved to the server",
          variant: "destructive",
        });
        
        // Refresh data from server to ensure UI is in sync
        // fetchRecentOrders();
      }
    };
    
    // Handle deleting an order with immediate UI update
    const handleDeleteOrder = async (orderId: string): Promise<void> => {
      if (!window.confirm('Are you sure you want to delete this order?')) {
        return;
      }
      
      // Immediately update UI by removing order from local state
      setRecentOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      // Close the dialog if the deleted order is the selected one
      if (selectedOrder && selectedOrder.id === orderId) {
        setIsModifyDialogOpen(false);
        setSelectedOrder(null);
      }
      
      // Show success message
      toast({
        description: `Order deleted successfully`,
        duration: 3000,
      });
      
      // Get token for API call
      const token = localStorage.getItem('viet_baguette_token');
      
      // Call API directly instead of using context function to avoid page refresh
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Delete order error details:', errorData);
          throw new Error(`Failed to delete order: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the order.",
          variant: "destructive",
        });
        // If deletion fails, refresh data to restore correct state
        fetchRecentOrders();
      }
    };
    
    // Filter orders based on active tab
    const filteredOrders = recentOrders.filter(order => {
      if (activeTab === 'active') return order.status === 'ACTIVE';
      if (activeTab === 'completed') return order.status === 'COMPLETED' || order.status === 'CANCELLED';
      return true; // 'all' tab
    });
    
    // Order items by createdAt (most recent first) and urgent flag
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      // Urgent orders first
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
    // Reset selected order when changing tabs to avoid the blank dialog bug
    // useEffect(() => {
    //   setSelectedOrder(null);
    //   setIsModifyDialogOpen(false);
    // }, [activeTab]);
  
    return (
      <div className="w-full">
        {/* Header with title and refresh button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
          Recent Orders
            {isLoading && <span className="ml-2 text-sm font-normal text-muted-foreground">(Loading...)</span>}
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRecentOrders}
            disabled={isLoading}
            className="transition-all duration-200 hover:bg-muted"
          >
            <RefreshCw className={cn(
              "mr-2 h-4 w-4 transition-all", 
              isLoading && "animate-spin"
            )} />
            Refresh
          </Button>
        </div>
        
        {/* Tabs for active, completed, and all orders */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger className="flex justify-center" value="active">
              {t('dashboard.orders.activeTab')} ({recentOrders.filter(o => o.status === 'ACTIVE').length})
            </TabsTrigger>
            <TabsTrigger className="flex justify-center" value="completed">
              Completed/Cancelled ({recentOrders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED').length})
            </TabsTrigger>
            <TabsTrigger className="flex justify-center" value="all">
              All ({recentOrders.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Content for active, completed, and all orders */}
          <TabsContent value={activeTab} className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="mb-3">
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                      <Skeleton className="h-4 w-40 mt-2" />
                    </CardHeader>
                    <CardContent className="py-0 px-4 pb-3">
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-12 border rounded-md animate-in fade-in-50 zoom-in-95 duration-300">
                <p className="text-muted-foreground">No orders to display</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-240px)] pr-4" key={refreshKey}>
                <div className="space-y-1 animate-in fade-in-50 slide-in-from-bottom-5 duration-300 stagger-1">
                  {sortedOrders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className={cn(
                        "transition-all duration-300", 
                        `animate-in slide-in-from-right-5 duration-${300 + index * 50} delay-${index * 25}`
                      )}
                    >
                      <CompactOrderCard 
                        order={order} 
                        onStatusChange={handleOrderStatusChange}
                        onModify={handleModifyOrder}
                        onItemStatusChange={handleItemStatusChange}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Order modification dialog */}
        <OrderModificationDialog
          isOpen={isModifyDialogOpen}
          onClose={() => {
            // setIsModifyDialogOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSave={handleSaveModifiedOrder}
          handleDeleteOrder={handleDeleteOrder}
        />
      </div>
    );
  };

// Helper function to format time counter
const formatTimeElapsed = (date: Date): string => {
  const now = new Date();
  let diffMs = now.getTime() - date.getTime();
  
  // Calculate minutes and seconds
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // If order is exactly 30 minutes or more, use the "X time ago" format
  if (minutes >= 30) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // Otherwise format as mm:ss
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Status badges component
const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Active</Badge>;
    case 'COMPLETED':
      return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
    default:
      return null;
  }
};

// Order item component with image support
const OrderItemCard = ({ 
  item,
  onStatusChange 
}: { 
  item: OrderItem;
  onStatusChange?: (itemId: string, status: OrderItem['status']) => void;
}) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3 border">
          <AvatarImage 
            src={item.menuItem.image} 
            alt={item.menuItem.name} 
          />
          <AvatarFallback>{item.quantity}x</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{item.menuItem.name}</p>
          {item.options && item.options.length > 0 && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {item.options.map(opt => `${opt.menuOption.name}: ${opt.optionChoice.name}`).join(', ')}
            </p>
          )}
          {item.notes && (
            <p className="text-xs italic text-muted-foreground truncate max-w-[200px]">
              {item.notes}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {item.status}
        </Badge>
        
        {onStatusChange && (
          <>
            {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                title="Mark as completed"
                onClick={() => onStatusChange(item.id, 'COMPLETED')}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {item.status !== 'CANCELLED' && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                title="Cancel item"
                onClick={() => onStatusChange(item.id, 'CANCELLED')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Compact order card component
const CompactOrderCard = ({ 
  order, 
  onStatusChange,
  onModify,
  onItemStatusChange
}: { 
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  onModify: (order: Order) => void;
  onItemStatusChange?: (orderId: string, itemId: string, status: OrderItem['status']) => void;
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [tickAnimation, setTickAnimation] = useState(false);
  
  // Dynamic time counter for active orders
  const [timeCounter, setTimeCounter] = useState(
    order.status === 'ACTIVE' 
      ? formatTimeElapsed(new Date(order.createdAt))
      : formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
  );

  // Update time counter more frequently (every second) for active orders
  useEffect(() => {
    if (order.status === 'ACTIVE') {
      // Initial update
      setTimeCounter(formatTimeElapsed(new Date(order.createdAt)));
      
      // Set up timer for regular updates
      const timer = setInterval(() => {
        const formattedTime = formatTimeElapsed(new Date(order.createdAt));
        setTimeCounter(formattedTime);
        
        // Trigger the tick animation
        setTickAnimation(true);
        setTimeout(() => setTickAnimation(false), 500);
      }, 1000); // Update every second for accurate mm:ss display
      
      return () => clearInterval(timer);
    }
  }, [order.createdAt, order.status]);

  // Handle item status changes
  const handleItemStatusChange = (itemId: string, status: OrderItem['status']) => {
    if (onItemStatusChange) {
      onItemStatusChange(order.id, itemId, status);
    }
  };

  // Toggle expansion when clicking on the card
  const toggleExpanded = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons or interactive elements
    if (
      (e.target as HTMLElement).closest('button') || 
      (e.target as HTMLElement).closest('.interactive-element')
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
      className={cn(
        "mb-3 transition-all duration-300 hover:shadow-md cursor-pointer",
        order.isUrgent ? 'border-red-500 dark:border-red-700' : '',
        order.status === 'ACTIVE' ? 'bg-white dark:bg-background' : 'bg-muted/20'
      )}
      onClick={toggleExpanded}
    >
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm flex items-center">
              Order #{order.id.slice(-4)}
              {order.isUrgent && (
                <div className="relative ml-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
              )}
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {order.status === 'ACTIVE' ? (
                <div className="flex items-center">
                  <Clock className={cn(
                    "mr-1 h-3 w-3 text-blue-500",
                    tickAnimation && "animate-ping"
                  )} />
                  <span className={cn(
                    "font-medium text-blue-600 dark:text-blue-400",
                    tickAnimation && "text-blue-700 dark:text-blue-300 transition-colors"
                  )}>
                    {timeCounter}
                  </span>
                </div>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </>
              )}
              
              {order.tableNumber && (
                <span className="ml-2">• Table {order.tableNumber}</span>
              )}
              {order.customerName && (
                <span className="ml-2">• {order.customerName}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 interactive-element">
            <OrderStatusBadge status={order.status} />
            
            {/* Quick status update buttons */}
            {order.status === 'ACTIVE' && (
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                  disabled={isChangingStatus}
                  onClick={(e) => {
                    // Update UI immediately without waiting for API
                    setIsChangingStatus(true);
                    // Call status change but don't await it
                    onStatusChange(order.id, 'COMPLETED');
                    // Reset loading after a brief delay for better UX
                    setTimeout(() => setIsChangingStatus(false), 300);
                  }}
                >
                  {isChangingStatus ? (
                    <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  )}
                  Complete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                  disabled={isChangingStatus}
                  onClick={(e) => {
                    // Update UI immediately without waiting for API
                    setIsChangingStatus(true);
                    // Call status change but don't await it
                    onStatusChange(order.id, 'CANCELLED');
                    // Reset loading after a brief delay for better UX
                    setTimeout(() => setIsChangingStatus(false), 300);
                  }}
                >
                  {isChangingStatus ? (
                    <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5 mr-1" />
                  )}
                  Cancel
                </Button>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onModify(order);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-0 px-4 pb-3">
        <div className="interactive-element">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • £{order.total.toFixed(2)}
            </span>
            <Button 
              variant="link" 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }} 
              className="p-0 h-auto text-xs"
            >
              {isExpanded ? 'Hide items' : 'View items'}
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-2 mt-2 animate-in fade-in-50 slide-in-from-top-5 duration-300">
              {order.items.map((item) => (
                <OrderItemCard 
                  key={item.id} 
                  item={item} 
                  onStatusChange={handleItemStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Order modification dialog
const OrderModificationDialog = ({ 
  isOpen, 
  onClose, 
  order, 
  onSave,
  handleDeleteOrder
}: { 
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (modifiedOrder: Order) => Promise<void>;
  handleDeleteOrder: (orderId: string) => Promise<void>;
}) => {
  const [modifiedOrder, setModifiedOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setModifiedOrder(JSON.parse(JSON.stringify(order)));
    }
  }, [order]);

  const handleUpdateItemQuantity = (itemIndex: number, change: number) => {
    if (!modifiedOrder) return;
    
    const updatedItems = [...modifiedOrder.items];
    const newQuantity = updatedItems[itemIndex].quantity + change;
    
    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      if (window.confirm('Remove this item from the order?')) {
        updatedItems.splice(itemIndex, 1);
      } else {
        return; // User canceled
      }
    } else {
      updatedItems[itemIndex].quantity = newQuantity;
    }
    
    setModifiedOrder({
      ...modifiedOrder,
      items: updatedItems,
      // Recalculate total
      total: updatedItems.reduce((sum, item) => {
        const basePrice = item.menuItem.price * item.quantity;
        const optionsPrice = item.options 
          ? item.options.reduce((optSum, opt) => optSum + ((opt.optionChoice.price || 0) * item.quantity), 0)
          : 0;
        return sum + basePrice + optionsPrice;
      }, 0)
    });
  };

  const handleUpdateItemStatus = (itemIndex: number, status: OrderItem['status']) => {
    if (!modifiedOrder) return;
    
    const updatedItems = [...modifiedOrder.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      status
    };
    
    setModifiedOrder({
      ...modifiedOrder,
      items: updatedItems
    });
  };

  const handleUpdateItemNotes = (itemIndex: number, notes: string) => {
    if (!modifiedOrder) return;
    
    const updatedItems = [...modifiedOrder.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      notes
    };
    
    setModifiedOrder({
      ...modifiedOrder,
      items: updatedItems
    });
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (!modifiedOrder) return;
    
    if (window.confirm('Are you sure you want to remove this item?')) {
      const updatedItems = [...modifiedOrder.items];
      updatedItems.splice(itemIndex, 1);
      
      setModifiedOrder({
        ...modifiedOrder,
        items: updatedItems,
        // Recalculate total
        total: updatedItems.reduce((sum, item) => {
          const basePrice = item.menuItem.price * item.quantity;
          const optionsPrice = item.options 
            ? item.options.reduce((optSum, opt) => optSum + ((opt.optionChoice.price || 0) * item.quantity), 0)
            : 0;
          return sum + basePrice + optionsPrice;
        }, 0)
      });
    }
  };

  const handleSaveModifications = async () => {
    if (!modifiedOrder) return;
    
    // setIsSaving(true);
    try {
      // Call the parent's save function that will immediately update UI
      await onSave(modifiedOrder);
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!modifiedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Modify Order #{modifiedOrder.id.slice(-4)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="table-number">Table Number</Label>
              <Input 
                id="table-number" 
                value={modifiedOrder.tableNumber || ''} 
                onChange={(e) => setModifiedOrder({
                  ...modifiedOrder,
                  tableNumber: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input 
                id="customer-name" 
                value={modifiedOrder.customerName || ''} 
                onChange={(e) => setModifiedOrder({
                  ...modifiedOrder,
                  customerName: e.target.value || undefined
                })}
              />
            </div>
            <div>
              <Label htmlFor="order-status">Order Status</Label>
              <Select 
                value={modifiedOrder.status}
                onValueChange={(value) => setModifiedOrder({
                  ...modifiedOrder,
                  status: value as Order['status']
                })}
              >
                <SelectTrigger id="order-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Order Flags */}
          <div className="flex items-center space-x-6 pt-2">
            <div className="flex items-center space-x-2">
              <label 
                htmlFor="urgent-toggle"
                className="text-sm font-medium flex items-center cursor-pointer"
              >
                <AlertTriangle className="mr-1.5 h-4 w-4 text-red-500" />
                Mark as Urgent
              </label>
              <Switch 
                id="urgent-toggle"
                checked={modifiedOrder.isUrgent || false}
                onCheckedChange={(checked) => setModifiedOrder({
                  ...modifiedOrder,
                  isUrgent: checked
                })}
              />
            </div>
          </div>
          
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            {modifiedOrder.items.length === 0 ? (
              <div className="text-center py-6 border rounded-md">
                <p className="text-muted-foreground">No items in this order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modifiedOrder.items.map((item, index) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-3 border">
                          <AvatarImage src={item.menuItem.image} alt={item.menuItem.name} />
                          <AvatarFallback>{item.quantity}x</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{item.menuItem.name}</h4>
                          {item.options && item.options.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {item.options.map(opt => `${opt.menuOption.name}: ${opt.optionChoice.name}`).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleUpdateItemQuantity(index, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleUpdateItemQuantity(index, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`item-notes-${index}`}>Special Instructions</Label>
                      <Textarea 
                        id={`item-notes-${index}`}
                        value={item.notes || ''} 
                        onChange={(e) => handleUpdateItemNotes(index, e.target.value)}
                        placeholder="Add any special instructions..."
                        className="resize-none mt-1"
                        rows={2}
                      />
                    </div>

                    <div className="mt-2">
                      <Label htmlFor={`item-${index}-status`}>Status</Label>
                      <Select 
                        value={item.status}
                        onValueChange={(value) => handleUpdateItemStatus(index, value as OrderItem['status'])}
                      >
                        <SelectTrigger id={`item-${index}-status`}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PREPARING">Preparing</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total */}
          <div className="flex justify-between items-center font-medium text-lg border-t pt-4 mt-6">
            <span>Total</span>
            <span>£{modifiedOrder.total.toFixed(2)}</span>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <Button 
            variant="destructive" 
            onClick={() => handleDeleteOrder(modifiedOrder.id)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete Order
              </>
            )}
          </Button>
          <div className="flex space-x-2">
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveModifications} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecentShiftOrders; 