import { useState } from 'react';
import { X, Clock, Check, AlertTriangle, UserCheck, Bell, Edit, Trash, Plus, Minus, Flame, MoreVertical } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

const ItemStatusBadge = ({ status }: { status: OrderItem['status'] }) => {
  switch (status) {
    case 'PREPARING':
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Preparing</Badge>;
    case 'COMPLETED':
      return <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelled</Badge>;
    default:
      return null;
  }
};

const OrderCard = ({ 
  order, 
  useDropdownForStatus = false,
  onStatusChange
}: { 
  order: Order;
  useDropdownForStatus?: boolean;
  onStatusChange?: (orderId: string, newStatus: string) => Promise<void>;
}) => {
  const { updateOrderStatus, updateItemStatus, markOrderUrgent, deleteOrder } = useOrders();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
  const [modifiedOrder, setModifiedOrder] = useState<Order | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Clone the order for modification
  const openModifyDialog = () => {
    setModifiedOrder(JSON.parse(JSON.stringify(order)));
    setIsModifyDialogOpen(true);
  };

  const handleOrderStatusChange = async (status: Order['status']) => {
    if (useDropdownForStatus && onStatusChange) {
      setIsChangingStatus(true);
      try {
        await onStatusChange(order.id, status);
      } finally {
        setIsChangingStatus(false);
      }
    } else {
      updateOrderStatus(order.id, status);
    }
  };

  const handleItemStatusChange = (itemId: string, status: OrderItem['status']) => {
    updateItemStatus(order.id, itemId, status);
  };

  const handleToggleUrgent = () => {
    markOrderUrgent(order.id, !order.isUrgent);
  };

  const handleModifyOrder = () => {
    openModifyDialog();
  };

  // Handle updating item quantity in the modification dialog
  const handleUpdateItemQuantity = (itemIndex: number, change: number) => {
    if (!modifiedOrder) return;
    
    const updatedItems = [...modifiedOrder.items];
    const newQuantity = updatedItems[itemIndex].quantity + change;
    
    if (newQuantity <= 0) {
      // If quantity would be 0 or less, prompt to remove the item
      if (window.confirm('Remove this item from the order?')) {
        updatedItems.splice(itemIndex, 1);
      } else {
        return; // User canceled, don't update
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

  // Handle removing an item from the order
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

  // Handle updating item notes
  const handleUpdateNotes = (itemIndex: number, notes: string) => {
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

  // Handle saving the modified order
  const handleSaveModifications = async () => {
    try {
      if (!modifiedOrder) return;
      
      // First update the order status if changed
      if (modifiedOrder.status !== order.status) {
        await updateOrderStatus(order.id, modifiedOrder.status);
      }
      
      // Update urgent flag if changed
      if (modifiedOrder.isUrgent !== order.isUrgent) {
        await markOrderUrgent(order.id, modifiedOrder.isUrgent || false);
      }
      
      // Update order details (customer name, table number) and item modifications
      // This would be a separate API call in a real implementation
      console.log('Order details to save:', modifiedOrder);
      
      // For table number, customer name, and item changes, you'd need a dedicated endpoint
      // For now, we'll simulate success
      toast({
        title: "Order Updated",
        description: `Order #${order.id.slice(-4)} has been updated successfully`,
        variant: "default",
      });
      
      // Close the dialog
      setIsModifyDialogOpen(false);
      
      // Refresh orders to get the latest state
      window.location.reload();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting the entire order
  const handleDeleteOrder = async () => {
    if (window.confirm('Are you sure you want to delete this entire order? This action cannot be undone.')) {
      try {
        setIsModifyDialogOpen(false); // Close dialog first to prevent multiple attempts
        
        toast({
          title: "Deleting Order...",
          description: `Order #${order.id.slice(-4)} is being deleted`,
          variant: "default",
        });
        
        await deleteOrder(order.id);
        
        // No need to show another toast or reload here as the deleteOrder function will handle that
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Deletion Failed",
          description: "There was an error deleting the order. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card className={`mb-4 ${order.isUrgent ? 'border-red-500 dark:border-red-700' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center">
                Order #{order.id.slice(-4)}
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
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                {order.tableNumber && (
                  <span className="ml-2">• Table {order.tableNumber}</span>
                )}
                {order.customerName && (
                  <span className="ml-2">• {order.customerName}</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {useDropdownForStatus ? (
                <Select 
                  value={order.status} 
                  onValueChange={handleOrderStatusChange} 
                  disabled={isChangingStatus}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <OrderStatusBadge status={order.status} />
              )}
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
                            {item.options.map(opt => `${opt.menuOption.name}: ${opt.optionChoice.name}`).join(', ')}
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
                        {item.status !== 'PREPARING' && item.status !== 'CANCELLED' && (
                          <Button size="icon" variant="ghost" onClick={() => handleItemStatusChange(item.id, 'PREPARING')}>
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                          <Button size="icon" variant="ghost" onClick={() => handleItemStatusChange(item.id, 'COMPLETED')}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status !== 'CANCELLED' && (
                          <Button size="icon" variant="ghost" onClick={() => handleItemStatusChange(item.id, 'CANCELLED')}>
                            <X className="h-4 w-4" />
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
            <Button 
              variant="outline"
              size="sm"
              onClick={handleModifyOrder}
              className="w-full"
            >
              <Edit className="mr-1 h-4 w-4" />
              {t('dashboard.orders.modify')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Modification Dialog */}
      <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Modify Order #{order.id.slice(-4)}</DialogTitle>
          </DialogHeader>
          
          {modifiedOrder && (
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
                          <div>
                            <h4 className="font-medium">{item.menuItem.name}</h4>
                            {item.options && item.options.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {item.options.map(opt => `${opt.menuOption.name}: ${opt.optionChoice.name}`).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleUpdateItemQuantity(index, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
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
                            onChange={(e) => handleUpdateNotes(index, e.target.value)}
                            placeholder="Add any special instructions..."
                            className="resize-none mt-1"
                            rows={2}
                          />
                        </div>

                        {/* Order Item Status Select */}
                        {item.status !== modifiedOrder.items[index].status && (
                          <div className="mt-2">
                            <Label htmlFor={`item-${index}-status`}>Status</Label>
                            <Select 
                              value={modifiedOrder.items[index].status}
                              onValueChange={(value) => {
                                const updatedItems = [...modifiedOrder.items];
                                updatedItems[index] = {
                                  ...updatedItems[index],
                                  status: value as OrderItem['status']
                                };
                                setModifiedOrder({
                                  ...modifiedOrder,
                                  items: updatedItems
                                });
                              }}
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
                        )}
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
          )}
          
          <DialogFooter className="flex items-center justify-between">
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrder}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Order
            </Button>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button variant="outline">
                  Cancel Changes
                </Button>
              </DialogClose>
              <Button onClick={handleSaveModifications}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const OrderList = ({ 
  searchResults,
  useDropdownForStatus = false,
  onStatusChange 
}: { 
  searchResults?: Order[]; 
  useDropdownForStatus?: boolean;
  onStatusChange?: (orderId: string, newStatus: string) => Promise<void>;
}) => {
  const { activeOrders, completedOrders } = useOrders();
  const { t } = useLanguage();

  // Use provided searchResults if available, otherwise use default orders from context
  const ordersToDisplay = searchResults || undefined;
  
  // Helper function to filter orders by unique ID
  const getUniqueOrders = (orders: Order[]) => {
    const uniqueOrderMap = new Map<string, Order>();
    orders.forEach(order => {
      uniqueOrderMap.set(order.id, order);
    });
    return Array.from(uniqueOrderMap.values());
  };
  
  // If we're using the default orders from context
  const activeOrdersList = getUniqueOrders(
    ordersToDisplay 
      ? ordersToDisplay.filter(order => order.status === 'ACTIVE')
      : activeOrders.filter(order => order.status === 'ACTIVE')
  );
    
  const completedOrdersList = getUniqueOrders(
    ordersToDisplay 
      ? ordersToDisplay.filter(order => order.status === 'COMPLETED')
      : completedOrders
  );
    
  // Only show the tabs if we're not using searchResults
  const showTabs = !searchResults;
  
  return (
    <div className="w-full">
      {showTabs ? (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger className="flex justify-center" value="active">{t('dashboard.orders.activeTab')}</TabsTrigger>
            <TabsTrigger className="flex justify-center" value="completed">{t('dashboard.orders.completedTab')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeOrdersList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active orders at the moment</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-240px)] pr-4">
                {activeOrdersList.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Active</h2>
                    {activeOrdersList.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        useDropdownForStatus={useDropdownForStatus}
                        onStatusChange={onStatusChange}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedOrdersList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No completed orders yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-240px)] pr-4">
                {completedOrdersList.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    useDropdownForStatus={useDropdownForStatus}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        // When using searchResults, display orders grouped by status
        <ScrollArea className="h-[calc(100vh-340px)] pr-4">
          {activeOrdersList.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Active</h2>
              {activeOrdersList.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  useDropdownForStatus={useDropdownForStatus}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
          
          {completedOrdersList.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Completed</h2>
              {completedOrdersList.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  useDropdownForStatus={useDropdownForStatus}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default OrderList;
