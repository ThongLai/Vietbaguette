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
  activeOrders: Order[];
  completedOrders: Order[];
  cancelledOrders: Order[];
  fetchOrders: () => Promise<void>;
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
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // Fetch menu on mount
  useEffect(() => {
    fetchMenu();
  }, []);
  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_ORDER':
          setActiveOrders(prev => [data.order, ...prev]);
          // Play notification sound for new orders
          const audio = new Audio('/notification.mp3');
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
    fetchOrders();

    // Cleanup
    return () => {
      ws.close();
    };
  }, []);

  const fetchMenu = async () => {
    try {
      setIsMenuLoading(true);
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

  const fetchOrders = async () => {
    try {
      // Get JWT token from localStorage with the correct key
      const token = localStorage.getItem('viet_baguette_token');
      // Log token for debugging (remove in production)
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      // Fetch active orders
      const activeResponse = await fetch('/api/orders?status=ACTIVE', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!activeResponse.ok) throw new Error('Failed to fetch active orders');
      const activeData = await activeResponse.json();
      setActiveOrders(activeData);

      // Fetch completed orders
      const completedResponse = await fetch('/api/orders?status=COMPLETED', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!completedResponse.ok) throw new Error('Failed to fetch completed orders');
      const completedData = await completedResponse.json();
      setCompletedOrders(completedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
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
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.error('Failed to play notification sound', e));
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      throw error; // Re-throw to handle in the component
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
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

      // To prevent duplication, let's fetch the updated order list rather than manipulating the state
      await fetchOrders();
      
      toast.success(`Order status updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
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

  const markOrderVIP = async (orderId: string, isVIP: boolean) => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/orders/${orderId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isVIP }),
      });

      if (!response.ok) throw new Error('Failed to update order priority');

      setActiveOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, isVIP } : order
        )
      );

      if (isVIP) {
        toast.info('Order marked as VIP', {
          description: 'This order will receive priority treatment',
        });
      } else {
        toast.info('Order is no longer marked as VIP');
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
        orders: [...activeOrders, ...completedOrders],
        cancelledOrders: [],
        fetchOrders,
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
