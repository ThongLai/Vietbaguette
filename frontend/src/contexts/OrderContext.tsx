import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export interface MenuItem {
  id: string;
  name: string;
  namevi?: string;
  price: number;
  description?: string;
  image?: string;
  category: string;
  vegetarian?: boolean;
  options?: {
    id: string;
    name: string;
    choices: {
      id: string;
      name: string;
      price?: number;
      isDefault?: boolean;
    }[];
  }[];
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  options?: {
    menuOption: {
      id: string;
      name: string;
    };
    optionChoice: {
      id: string;
      name: string;
      price?: number;
    };
  }[];
  notes?: string;
  status: 'PREPARING' | 'COMPLETED' | 'CANCELLED';
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  tableNumber?: number;
  customerName?: string;
  isUrgent?: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface OrderContextType {
  menu: MenuItem[];
  isMenuLoading: boolean;
  orders: Order[];
  recentOrders: Order[];
  activeOrders: Order[];
  completedOrders: Order[];
  cancelledOrders: Order[];
  fetchOrders: () => Promise<Order[]>;
  loadRecentOrders: () => Promise<Order[]>;
  setRecentOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
  addOrder: (orderData: { 
    items: { 
      menuItemId: string; 
      quantity: number; 
      notes?: string;
      selectedOptions?: { 
        menuOptionId: string; 
        optionChoiceId: string;
      }[];
    }[];
    tableNumber?: number;
    customerName?: string;
  }) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => Promise<void>;
  markOrderUrgent: (orderId: string, isUrgent: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch menu on mount
  useEffect(() => {
    fetchMenu();
  }, []);
  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    // Use VITE_API_URL to determine backend host for WebSocket
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL is not set in the environment variables');
    }
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    // Remove trailing slash if present
    const cleanApiUrl = apiUrl.replace(/\/$/, '');
    // Remove protocol for host
    const wsHost = cleanApiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_ORDER':
          setActiveOrders(prev => [data.order, ...prev]);
          // Play notification sound for new orders
          const audio = new Audio('sound/notification.mp3');
          audio.play().catch(e => console.error('Failed to play notification sound', e));
          break;
          
        case 'ORDER_UPDATED':
          setActiveOrders(prev => prev.map(order => 
            order.id === data.order.id ? data.order : order
          ));
          break;
          
        case 'ORDER_COMPLETED':
          setActiveOrders(prev => prev.filter(order => order.id !== data.order.id));
          setCompletedOrders(prev => [data.order, ...prev]);
          break;
      }
    };

    // Initial fetch
    // loadRecentOrders();

    // Cleanup
    return () => {
      ws.close();
    };
  }, []);

  const fetchMenu = async () => {
    setIsMenuLoading(true);
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch('/api/menu', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Failed to fetch menu');
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu items');
    } finally {
      setIsMenuLoading(false);
    }
  };

  const fetchOrders = async (): Promise<Order[]> => {
    // Skip if already fetching to prevent duplicate calls
    if (isLoadingOrders) return;
    
    setIsLoadingOrders(true);
    try {
      // Get JWT token from localStorage with the correct key
      const token = localStorage.getItem('viet_baguette_token');
      
      // Fetch all orders in a single request
      const response = await fetch('/api/orders', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const allOrders = await response.json();
      
      // Filter orders by status on the client side
      const active = allOrders.filter((order: Order) => order.status === 'ACTIVE');
      const completed = allOrders.filter((order: Order) => order.status === 'COMPLETED');
      const cancelled = allOrders.filter((order: Order) => order.status === 'CANCELLED');
      
      // Update state in a single batch to prevent multiple re-renders
      setActiveOrders(active);
      setCompletedOrders(completed);
      setCancelledOrders(cancelled);
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load orders from the last 10 hours
  const loadRecentOrders = async (): Promise<Order[]> => {
    // Skip if already fetching to prevent duplicate calls
    if (isLoadingOrders) return;

    setIsLoadingOrders(true);
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('viet_baguette_token');
      
      // Fetch recent orders from API endpoint
      console.log('Fetching recent orders...');
      const response = await fetch('/api/orders/recent', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response text:', await response.text());
        throw new Error('Failed to fetch recent orders');
      }
      
      const data = await response.json();
      console.log('Recent orders fetched:', data.length);
      setRecentOrders(data);
      return data;
    } catch (error) {
      console.error('Error loading recent orders:', error);
      // Fallback to using filtered orders from the regular orders list
      console.log('Falling back to filtered orders...');
      
      await fetchOrders(); // Fetch all orders (try not to do this as it is not efficient)

      const tenHoursAgo = new Date();
      tenHoursAgo.setHours(tenHoursAgo.getHours() - 10);
      
      const filteredOrders = orders.filter(order => 
        new Date(order.createdAt) >= tenHoursAgo
      );
      
      setRecentOrders(filteredOrders);
      toast.error('Failed to load recent orders - using local data');
      return filteredOrders;
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const addOrder = async (orderData: {
    items: {
      menuItemId: string;
      quantity: number;
      notes?: string;
      selectedOptions?: {
        menuOptionId: string;
        optionChoiceId: string;
      }[];
    }[];
    tableNumber?: number;
    customerName?: string;
  }) => {
    try {
      // Get JWT token from localStorage with the correct key
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        // Get the error details from the response
        const errorData = await response.json().catch(() => null);
        console.error('Order creation error details:', errorData);
        throw new Error('Failed to create order');
      }

      const newOrder = await response.json();
      setActiveOrders(prev => [newOrder, ...prev]);

      toast.success('Order placed successfully!', {
        description: `Order #${newOrder.id.substring(0, 8)} has been created`,
      });

      // Play notification sound
      const audio = new Audio('sound/notification.mp3');
      audio.play().catch(e => console.error('Failed to play notification sound', e));
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      throw error; // Re-throw to handle in the component
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Find the existing order before making API call
      const existingOrder = [...activeOrders, ...completedOrders, ...cancelledOrders]
        .find(order => order.id === orderId);
        
      if (!existingOrder) {
        throw new Error('Order not found');
      }
      
      // Create an updated version of the order
      const updatedOrder = {
        ...existingOrder,
        status
      };
      
      // Update UI immediately for better UX
      // Handle updating the different order lists based on new status
      if (status === 'ACTIVE') {
        // Remove from completed/cancelled if present
        setCompletedOrders(prev => prev.filter(order => order.id !== orderId));
        setCancelledOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Add to active if not already there or update it
        setActiveOrders(prev => {
          const exists = prev.some(order => order.id === orderId);
          if (exists) {
            return prev.map(order => order.id === orderId ? updatedOrder : order);
          } else {
            return [updatedOrder, ...prev];
          }
        });
      } else if (status === 'COMPLETED') {
        // Remove from active/cancelled if present
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));
        setCancelledOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Add to completed if not already there or update it
        setCompletedOrders(prev => {
          const exists = prev.some(order => order.id === orderId);
          if (exists) {
            return prev.map(order => order.id === orderId ? updatedOrder : order);
          } else {
            return [updatedOrder, ...prev];
          }
        });
      } else if (status === 'CANCELLED') {
        // Remove from active/completed if present
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));
        setCompletedOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Add to cancelled if not already there or update it
        setCancelledOrders(prev => {
          const exists = prev.some(order => order.id === orderId);
          if (exists) {
            return prev.map(order => order.id === orderId ? updatedOrder : order);
          } else {
            return [updatedOrder, ...prev];
          }
        });
      }
      
      // Now make the API call
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      // Update with server response data if needed
      const serverUpdatedOrder = await response.json();
      
      toast.success(`Order status updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      
            // On error, fetch orders again to ensure UI is in sync with backend      loadRecentOrders();
    }
  };

  const updateItemStatus = async (orderId: string, itemId: string, status: OrderItem['status']) => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update item status');

      const { item, order } = await response.json();

      setActiveOrders(prev => {
        const updatedOrders = prev.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              items: o.items.map(i => (i.id === itemId ? item : i)),
              ...(order ? { status: order.status } : {}),
            };
          }
          return o;
        });

        // If order status changed to completed, move it
        if (order?.status === 'COMPLETED') {
          const completedOrder = updatedOrders.find(o => o.id === orderId);
          if (completedOrder) {
            setCompletedOrders(prev => [completedOrder, ...prev]);
          }
          return updatedOrders.filter(o => o.id !== orderId);
        }

        return updatedOrders;
      });

      toast.success(`Item status updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const markOrderUrgent = async (orderId: string, isUrgent: boolean) => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/orders/${orderId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isUrgent }),
      });

      if (!response.ok) throw new Error('Failed to update order priority');

      setActiveOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, isUrgent } : order
        )
      );

      if (isUrgent) {
        toast.warning('Order marked as urgent!', {
          description: `Order #${orderId.substring(0, 8)} needs immediate attention`,
        });
      } else {
        toast.info('Order is no longer urgent');
      }
    } catch (error) {
      console.error('Error updating order priority:', error);
      toast.error('Failed to update order priority');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        // Try to get more error details from the response
        const errorData = await response.json().catch(() => null);
        console.error('Delete order error details:', errorData);
        throw new Error(`Failed to delete order: ${response.status} ${response.statusText}`);
      }

      // Remove from both active and completed orders
      setActiveOrders(prev => prev.filter(order => order.id !== orderId));
      setCompletedOrders(prev => prev.filter(order => order.id !== orderId));

      toast.success('Order deleted successfully');
      
      // Force reload the page to ensure all UI components are updated
      window.location.reload();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
      throw error; // Re-throw to handle in the component
    }
  };

  return (
    <OrderContext.Provider
      value={{
        menu,
        isMenuLoading,
        activeOrders,
        completedOrders,
        cancelledOrders,
        recentOrders,
        orders: [...activeOrders, ...completedOrders, ...cancelledOrders],
        fetchOrders,
        loadRecentOrders,
        setRecentOrders,
        addOrder,
        updateOrderStatus,
        updateItemStatus,
        markOrderUrgent,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
