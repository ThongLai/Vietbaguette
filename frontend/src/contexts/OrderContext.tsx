
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

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
    name: string;
    choices: {
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
    name: string;
    choice: string;
    extraPrice?: number;
  }[];
  notes?: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  timestamp: string;
  tableNumber?: number;
  customerName?: string;
  isUrgent?: boolean;
  isVIP?: boolean;
}

interface OrderContextType {
  menu: MenuItem[];
  activeOrders: Order[];
  completedOrders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  modifyOrderItem: (orderId: string, itemId: string, updates: Partial<OrderItem>) => void;
  markOrderUrgent: (orderId: string, isUrgent: boolean) => void;
  markOrderVIP: (orderId: string, isVIP: boolean) => void;
  cancelOrder: (orderId: string) => void;
}

// Mock menu data
const mockMenu: MenuItem[] = [
  {
    id: '1',
    name: 'Spring Rolls',
    namevi: 'Chả Giò',
    price: 5.00,
    description: '3 spring rolls with vegetables, vermicelli herbs, served with sweet chili dip',
    image: '/placeholder.svg',
    category: 'starters',
    vegetarian: false,
  },
  {
    id: '2',
    name: 'Pho',
    namevi: 'Phở',
    price: 8.00,
    description: 'Aromatic Vietnamese soup with broth, rice noodles, bean sprouts, herbs, and your choice of protein',
    image: '/placeholder.svg',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Beef' },
          { name: 'Chicken' },
          { name: 'Prawn' },
          { name: 'Tofu', price: 0 },
        ],
      },
      {
        name: 'Extra',
        choices: [
          { name: 'Poached egg', price: 2 },
          { name: 'Beef', price: 2 },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Baguette',
    namevi: 'Bánh Mì',
    price: 7.00,
    description: 'A unique homemade baguette filled with salad, pickles, herbs and your choice of protein',
    image: '/placeholder.svg',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Grilled pork with pate' },
          { name: 'Chicken' },
          { name: 'Beef' },
          { name: 'Fried egg/tofu' },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Vietnamese Curry',
    namevi: 'Cà Ri',
    price: 7.50,
    description: 'Rich and aromatic curry with your choice of protein',
    image: '/placeholder.svg',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Chicken breast' },
          { name: 'Beef' },
          { name: 'Prawn', price: 1 },
          { name: 'Tofu' },
        ],
      },
    ],
  },
  {
    id: '5',
    name: 'Vietnamese Coffee',
    namevi: 'Cà Phê',
    price: 3.00,
    description: 'Slow-brewed Vietnamese dripping coffee with rich bold flavors and a smooth, aromatic finish',
    image: '/placeholder.svg',
    category: 'drinks',
    vegetarian: true,
  },
  {
    id: '6',
    name: 'Bubble Tea',
    namevi: 'Trà Sữa',
    price: 4.50,
    description: 'Flavoured milk powder, syrup, milk, jasmine tea and toppings',
    image: '/placeholder.svg',
    category: 'drinks',
    vegetarian: true,
    options: [
      {
        name: 'Flavor',
        choices: [
          { name: 'Strawberry' },
          { name: 'Mango' },
          { name: 'Chocolate' },
          { name: 'Taro' },
          { name: 'Matcha' },
          { name: 'Original' },
          { name: 'Brown Sugar' },
        ],
      },
      {
        name: 'Tapioca',
        choices: [
          { name: 'Original' },
          { name: 'Brown Sugar' },
          { name: 'None' },
        ],
      },
      {
        name: 'Ice Level',
        choices: [
          { name: '25%' },
          { name: '50%' },
          { name: '75%' },
          { name: '100%' },
        ],
      },
    ],
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [menu, setMenu] = useState<MenuItem[]>(mockMenu);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // Load orders from localStorage on component mount
  useEffect(() => {
    const storedActiveOrders = localStorage.getItem('viet_baguette_active_orders');
    const storedCompletedOrders = localStorage.getItem('viet_baguette_completed_orders');
    
    if (storedActiveOrders) {
      try {
        setActiveOrders(JSON.parse(storedActiveOrders));
      } catch (e) {
        console.error('Failed to parse stored active orders', e);
      }
    }
    
    if (storedCompletedOrders) {
      try {
        setCompletedOrders(JSON.parse(storedCompletedOrders));
      } catch (e) {
        console.error('Failed to parse stored completed orders', e);
      }
    }
  }, []);

  // Save orders to localStorage when they change
  useEffect(() => {
    localStorage.setItem('viet_baguette_active_orders', JSON.stringify(activeOrders));
  }, [activeOrders]);
  
  useEffect(() => {
    localStorage.setItem('viet_baguette_completed_orders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  const addOrder = (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...orderData,
    };
    
    setActiveOrders(prev => [newOrder, ...prev]);
    
    // Show a notification
    toast.success('New order added!', {
      description: `Order #${newOrder.id.slice(-4)} with ${newOrder.items.length} items`,
      action: {
        label: 'View',
        onClick: () => {
          // In a real app, this would navigate to the order details
          console.log('View order', newOrder);
        },
      },
    });
    
    // Play a notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.error('Failed to play notification sound', e));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setActiveOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id === orderId) {
          return { ...order, status };
        }
        return order;
      });
      
      // If the order is completed, move it to completedOrders
      if (status === 'completed' || status === 'cancelled') {
        const orderToMove = prev.find(order => order.id === orderId);
        if (orderToMove) {
          setCompletedOrders(prevCompleted => [
            { ...orderToMove, status },
            ...prevCompleted,
          ]);
        }
        return updatedOrders.filter(order => order.id !== orderId);
      }
      
      return updatedOrders;
    });

    toast.info(`Order status updated to ${status}`);
  };

  const updateItemStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    setActiveOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, status };
            }
            return item;
          });
          
          // Check if all items are completed to update order status
          const allCompleted = updatedItems.every(item => item.status === 'completed');
          
          return { 
            ...order, 
            items: updatedItems,
            status: allCompleted ? 'completed' : order.status 
          };
        }
        return order;
      });
      
      // Move completed orders
      const orderToCheck = updatedOrders.find(order => order.id === orderId);
      if (orderToCheck && orderToCheck.items.every(item => item.status === 'completed')) {
        setCompletedOrders(prevCompleted => [
          { ...orderToCheck, status: 'completed' },
          ...prevCompleted,
        ]);
        return updatedOrders.filter(order => order.id !== orderId);
      }
      
      return updatedOrders;
    });

    toast.info(`Item status updated to ${status}`);
  };

  const modifyOrderItem = (orderId: string, itemId: string, updates: Partial<OrderItem>) => {
    setActiveOrders(prev => {
      return prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, ...updates };
            }
            return item;
          });
          
          // Recalculate total
          const newTotal = updatedItems.reduce((sum, item) => {
            let itemTotal = item.menuItem.price * item.quantity;
            
            // Add any option extra prices
            if (item.options) {
              itemTotal += item.options.reduce(
                (optionSum, option) => optionSum + (option.extraPrice || 0),
                0
              ) * item.quantity;
            }
            
            return sum + itemTotal;
          }, 0);
          
          return { 
            ...order, 
            items: updatedItems,
            total: newTotal
          };
        }
        return order;
      });
    });

    toast.info('Order modified', {
      description: 'The order has been updated',
    });
  };

  const markOrderUrgent = (orderId: string, isUrgent: boolean) => {
    setActiveOrders(prev => {
      return prev.map(order => {
        if (order.id === orderId) {
          return { ...order, isUrgent };
        }
        return order;
      });
    });

    if (isUrgent) {
      toast.warning('Order marked as urgent!', {
        description: `Order #${orderId.slice(-4)} needs to be prepared quickly!`,
      });
    } else {
      toast.info('Order is no longer urgent');
    }
  };

  const markOrderVIP = (orderId: string, isVIP: boolean) => {
    setActiveOrders(prev => {
      return prev.map(order => {
        if (order.id === orderId) {
          return { ...order, isVIP };
        }
        return order;
      });
    });

    if (isVIP) {
      toast.info('Order marked as VIP', {
        description: 'This order is for a VIP customer',
      });
    } else {
      toast.info('Order is no longer marked as VIP');
    }
  };

  const cancelOrder = (orderId: string) => {
    setActiveOrders(prev => {
      const orderToCancel = prev.find(order => order.id === orderId);
      
      if (orderToCancel) {
        setCompletedOrders(prevCompleted => [
          { ...orderToCancel, status: 'cancelled' },
          ...prevCompleted,
        ]);
      }
      
      return prev.filter(order => order.id !== orderId);
    });

    toast.error('Order cancelled');
  };

  return (
    <OrderContext.Provider
      value={{
        menu,
        activeOrders,
        completedOrders,
        addOrder,
        updateOrderStatus,
        updateItemStatus,
        modifyOrderItem,
        markOrderUrgent,
        markOrderVIP,
        cancelOrder,
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
