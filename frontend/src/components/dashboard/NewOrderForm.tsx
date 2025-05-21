import { useState, useEffect, useRef } from 'react';
import { useOrders, MenuItem } from '@/contexts/OrderContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Plus, Minus, Trash2, Check, Leaf, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { normalizeCategory } from '@/lib/menu-utils';
import { cn } from '@/lib/utils';
export type { CartItem };

// Update CartItem interface to match new data structure
interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  options: {
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
}

const MenuItemCard = ({ 
  item, 
  onAddToCart 
}: { 
  item: MenuItem; 
  onAddToCart: (item: MenuItem) => void;
}) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-sm transition-shadow duration-200">
      <div className="relative h-40 overflow-hidden bg-muted">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            No image
          </div>
        )}
        {item.vegetarian && (
          <Badge className="absolute top-2 right-2 bg-green-500 px-3 py-1 text-white shadow-sm">
            <Leaf className="h-4 w-4 mr-2" />
            Vegetarian
          </Badge>
        )}
      </div>
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-base">{item.name}</CardTitle>
        {item.namevi && (
          <p className="text-sm text-muted-foreground italic">{item.namevi}</p>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <p className="font-medium">£{item.price.toFixed(2)}</p>
        <Button 
          size="sm" 
          onClick={() => onAddToCart(item)}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
};

const CategorySection = ({ 
  title, 
  items, 
  onAddToCart 
}: { 
  title: string; 
  items: MenuItem[]; 
  onAddToCart: (item: MenuItem) => void;
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <MenuItemCard 
            key={item.id} 
            item={item} 
            onAddToCart={onAddToCart} 
          />
        ))}
      </div>
    </div>
  );
};

const CartItemComponent = ({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  onUpdateOptions,
  onUpdateNotes,
  exitOnDone,
  exitOnCancel
}: { 
  item: CartItem; 
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onUpdateOptions: (menuOptionId: string, optionChoiceId: string, price?: number) => void;
  onUpdateNotes: (notes: string) => void;
  exitOnDone?: () => void;
  exitOnCancel?: () => void;
}) => {
  // Use local state for editing
  const [localItem, setLocalItem] = useState<CartItem>(JSON.parse(JSON.stringify(item)));
  const [showOptions, setShowOptions] = useState(true);

  // Handlers for local editing
  const handleLocalUpdateQuantity = (quantity: number) => {
    setLocalItem({ ...localItem, quantity });
  };
  const handleLocalUpdateOptions = (menuOptionId: string, optionChoiceId: string, price?: number) => {
    const menuItem = localItem.menuItem;
    const menuOption = menuItem.options?.find(opt => opt.id === menuOptionId);
    if (!menuOption) return;
    const optionChoice = menuOption.choices.find(choice => choice.id === optionChoiceId);
    if (!optionChoice) return;
    const optionIndex = localItem.options.findIndex(opt => opt.menuOption.id === menuOptionId);
    const newOption = {
      menuOption: { id: menuOption.id, name: menuOption.name },
      optionChoice: { id: optionChoice.id, name: optionChoice.name, price: optionChoice.price },
    };
    let newOptions = [...localItem.options];
    if (optionIndex >= 0) {
      newOptions[optionIndex] = newOption;
    } else {
      newOptions.push(newOption);
    }
    setLocalItem({ ...localItem, options: newOptions });
  };
  const handleLocalUpdateNotes = (notes: string) => {
    setLocalItem({ ...localItem, notes });
  };

  // Save changes to parent on Done
  const handleDone = () => {
    onUpdateQuantity(localItem.quantity);
    localItem.options.forEach(opt => {
      onUpdateOptions(opt.menuOption.id, opt.optionChoice.id, opt.optionChoice.price);
    });
    onUpdateNotes(localItem.notes || '');
    if (exitOnDone) exitOnDone();
  };

  // Cancel: just exit, don't save
  const handleCancel = () => {
    if (exitOnCancel) exitOnCancel();
  };

  // Calculate total price for this item
  const basePrice = localItem.menuItem.price * localItem.quantity;
  const optionsPrice = localItem.options.reduce((total, opt) => 
    total + (opt.optionChoice.price || 0) * localItem.quantity, 0);
  const totalPrice = basePrice + optionsPrice;

  return (
    <div className="border rounded-md p-4 mb-4">
      {/* Main item info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-base">{localItem.menuItem.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-muted-foreground">
                  £{localItem.menuItem.price.toFixed(2)} each
                </p>
                {optionsPrice > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      +£{(optionsPrice / localItem.quantity).toFixed(2)} in options
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Options summary - only show when not expanded */}
          {!showOptions && localItem.options.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground line-clamp-1">
                {localItem.options.map(opt => opt.optionChoice.name).join(', ')}
              </p>
            </div>
          )}

          {/* Notes preview - only show when not expanded */}
          {!showOptions && localItem.notes && (
            <div className="mt-1">
              <p className="text-sm text-muted-foreground italic line-clamp-1">
                Note: {localItem.notes}
              </p>
            </div>
          )}
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            onClick={() => handleLocalUpdateQuantity(Math.max(1, localItem.quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{localItem.quantity}</span>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            onClick={() => handleLocalUpdateQuantity(localItem.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Options and Notes when expanded */}
      {showOptions && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Options selectors */}
          {localItem.menuItem.options && localItem.menuItem.options.length > 0 && (
            <div className="space-y-3">
              {localItem.menuItem.options.map((option) => (
                <div key={option.name} className="grid gap-1.5">
                  <Label htmlFor={`option-${option.name}`}>{option.name}</Label>
                  <Select
                    value={localItem.options.find(o => o.menuOption.id === option.id)?.optionChoice.id || ''}
                    onValueChange={(value) => {
                      const choice = option.choices.find(c => c.id === value);
                      handleLocalUpdateOptions(option.id, value, choice?.price);
                    }}
                  >
                    <SelectTrigger id={`option-${option.name}`}>
                      <SelectValue placeholder={`Select ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.choices.map((choice) => (
                        <SelectItem key={choice.id} value={choice.id}>
                          {choice.name}
                          {choice.price ? ` (+£${choice.price.toFixed(2)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests?"
              value={localItem.notes || ''}
              onChange={(e) => handleLocalUpdateNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Footer with total and actions */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <p className="font-medium flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="text-base">£{(localItem.menuItem.price * localItem.quantity + localItem.options.reduce((total, opt) => total + (opt.optionChoice.price || 0) * localItem.quantity, 0)).toFixed(2)}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 px-3 hover:bg-muted"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="h-8 px-3 hover:bg-muted"
            onClick={handleDone}
          >
            Done
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const SimplifiedCartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  onCustomize
}: {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onCustomize: () => void;
}) => {
  // Calculate total price for this item
  const basePrice = item.menuItem.price * item.quantity;
  const optionsPrice = item.options.reduce((total, opt) => 
    total + (opt.optionChoice.price || 0) * item.quantity, 0);
  const totalPrice = basePrice + optionsPrice;
  
  // Get options as comma-separated string
  const optionsText = item.options.map(o => o.optionChoice.name).join(', ');

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex justify-between mb-1">
        <div>
          <h4 className="font-medium text-base">{item.menuItem.name}</h4>
          {optionsText && (
            <p className="text-sm text-muted-foreground mt-0.5">{optionsText}</p>
          )}
          {item.notes && (
            <p className="text-sm italic text-muted-foreground mt-0.5">Note: {item.notes}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium">£{totalPrice.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">£{item.menuItem.price.toFixed(2)} each</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button 
            variant="outline" 
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onCustomize}
          >
            Customize
          </Button>
          <Button
            variant="ghost"
            size="sm"  
            className="h-7 text-xs text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const CategoryTabsNav = ({
  scrollRef,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  children
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute left-0 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm transition-opacity duration-200", 
          !canScrollLeft && "opacity-0 pointer-events-none"
        )}
        onClick={onScrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {children}
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute right-0 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm transition-opacity duration-200",
          !canScrollRight && "opacity-0 pointer-events-none"
        )}
        onClick={onScrollRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Add CSS for hiding scrollbars
const scrollbarHideClass = "scrollbar-none scrollbar-hide";

const NewOrderForm = () => {
  const { menu, isMenuLoading, addOrder } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Refs and state for category tabs scrolling
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Group menu items by category
  const categories = [...new Set(menu.map(item => item.category))].sort();
  const menuByCategory: Record<string, MenuItem[]> = {};
  
  categories.forEach(category => {
    menuByCategory[category] = menu.filter(item => item.category === category);
  });

  // Update scroll buttons visibility
  useEffect(() => {
    const checkScroll = () => {
      if (tabsListRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
      }
    };
    
    checkScroll();
    
    // Add scroll event listener to update button visibility during scrolling
    const tabsList = tabsListRef.current;
    if (tabsList) {
      tabsList.addEventListener('scroll', checkScroll);
      return () => tabsList.removeEventListener('scroll', checkScroll);
    }
  }, [activeCategory, isMenuLoading]);
  
  // Scroll functions
  const scrollLeft = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    console.log('Adding to cart:', menuItem);
    // Create default options if the menu item has options
    const defaultOptions = menuItem.options ? menuItem.options.map(option => ({
      menuOption: {
        id: option.id,
        name: option.name,
      },
      optionChoice: {
        id: option.choices[0].id,
        name: option.choices[0].name,
        price: option.choices[0].price,
      },
    })) : [];

    setCart([...cart, {
      menuItem,
      quantity: 1,
      options: defaultOptions,
      notes: '',
    }]);

    toast({
      title: "Added to order",
      description: `${menuItem.name} has been added to your order.`,
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
  };

  const handleRemoveItem = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    setCurrentEditingItem(null);
  };

  const handleUpdateOptions = (index: number, menuOptionId: string, optionChoiceId: string) => {
    const updatedCart = [...cart];
    const currentItem = updatedCart[index];
    const menuItem = currentItem.menuItem;
    
    // Find the menu option and choice
    const menuOption = menuItem.options?.find(opt => opt.id === menuOptionId);
    if (!menuOption) return;
    
    const optionChoice = menuOption.choices.find(choice => choice.id === optionChoiceId);
    if (!optionChoice) return;
    
    // Find if this option already exists
    const optionIndex = currentItem.options.findIndex(opt => opt.menuOption.id === menuOptionId);
    
    if (optionIndex >= 0) {
      // Update existing option
      currentItem.options[optionIndex] = {
        menuOption: {
          id: menuOption.id,
          name: menuOption.name,
        },
        optionChoice: {
          id: optionChoice.id,
          name: optionChoice.name,
          price: optionChoice.price,
        },
      };
    } else {
      // Add new option
      currentItem.options.push({
        menuOption: {
          id: menuOption.id,
          name: menuOption.name,
        },
        optionChoice: {
          id: optionChoice.id,
          name: optionChoice.name,
          price: optionChoice.price,
        },
      });
    }
    
    setCart(updatedCart);
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updatedCart = [...cart];
    updatedCart[index].notes = notes;
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const basePrice = item.menuItem.price * item.quantity;
      const optionsPrice = item.options.reduce((sum, opt) => 
        sum + (opt.optionChoice.price || 0) * item.quantity, 0);
      return total + basePrice + optionsPrice;
    }, 0);
  };

  // Function to clear the cart
  const clearCart = () => {
    setCart([]);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order.",
        variant: "destructive",
      });
      return;
    }

    // Validate options for required items
    const missingRequiredOptions = cart.some(item => 
      item.menuItem.options?.some(opt => 
        !item.options.some(selected => selected.menuOption.id === opt.id)
      )
    );

    if (missingRequiredOptions) {
      toast({
        title: "Missing Options",
        description: "Please select all required options for items in your order.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate total for the order
      const total = calculateTotal();

      // Format order data according to the Prisma schema
      const orderData = {
        tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
        customerName: customerName || undefined,
        items: cart.map(item => ({
          quantity: item.quantity,
          menuItemId: item.menuItem.id,
          notes: item.notes || '',
          selectedOptions: item.options.map(opt => ({
            menuOptionId: opt.menuOption.id,
            optionChoiceId: opt.optionChoice.id
          }))
        }))
      };

      // Submit order through context
      await addOrder(orderData);

      // Clear cart and show success message
      clearCart();
      // toast({
      //   title: "Order Placed Successfully",
      //   description: "New order has been placed.",
      //   variant: "default",
      // });

      // Reset form
      setTableNumber('');
      setCustomerName('');

    } catch (error) {
      console.error('Failed to place order:', error);
      toast({
        title: "Failed to Place Order",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Create New Order
                </CardTitle>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    Welcome back, {user.name}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isMenuLoading ? (
                <div className="p-6 space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="h-[280px] bg-muted animate-pulse rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <div className="px-2 sm:px-6 py-2 border-b relative">
                    <CategoryTabsNav
                      scrollRef={tabsListRef}
                      canScrollLeft={canScrollLeft}
                      canScrollRight={canScrollRight}
                      onScrollLeft={scrollLeft}
                      onScrollRight={scrollRight}
                    >
                      <div
                        ref={tabsListRef}
                        className={`overflow-x-scroll ${scrollbarHideClass} px-8 flex-1`}
                      >
                        <TabsList className="h-10 w-max flex justify-start bg-transparent p-0">
                          <TabsTrigger
                            value="all"
                            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground mr-2 px-4 py-1 transition-all duration-200 hover:bg-muted"
                          >
                            All
                          </TabsTrigger>
                          {categories.map((category) => (
                            <TabsTrigger
                              key={category}
                              value={category}
                              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground mr-2 whitespace-nowrap px-4 py-1 transition-all duration-200 hover:bg-muted"
                            >
                              {normalizeCategory(category)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                    </CategoryTabsNav>
                  </div>

                  <TabsContent value="all" className="mt-0 p-6">
                    <ScrollArea className="h-[calc(100vh-320px)]">
                      <div className="space-y-8">
                        {categories.map((category) => (
                          <CategorySection
                            key={category}
                            title={normalizeCategory(category)}
                            items={menuByCategory[category]}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {categories.map((category) => (
                    <TabsContent key={category} value={category} className="mt-0 p-6">
                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <CategorySection
                          title={normalizeCategory(category)}
                          items={menuByCategory[category]}
                          onAddToCart={handleAddToCart}
                        />
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Customer Info */}
                {cart.length > 0 && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline mb-2 transition-all duration-150 hover:text-primary hover:scale-105 hover:underline-offset-4 focus:outline-none"
                      onClick={() => setShowDetails((v) => !v)}
                    >
                      {showDetails ? "Hide details" : "Add table/customer details (optional)"}
                    </button>
                    {showDetails && (
                      <div className="space-y-2 animate-fade-in">
                        <div>
                          <Label htmlFor="tableNumber">Table Number (optional)</Label>
                          <Input
                            id="tableNumber"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Enter table number"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerName">Customer Name (optional)</Label>
                          <Input
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Cart Items */}
                <div>
                  <h3 className="font-medium mb-2">Items ({cart.length})</h3>
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border rounded-md">
                      <p>No items added yet</p>
                      <p className="text-sm mt-1">Select items & add them to your order</p>
                    </div>
                  ) : currentEditingItem !== null ? (
                    <CartItemComponent
                      item={cart[currentEditingItem]}
                      onUpdateQuantity={(quantity) => handleUpdateQuantity(currentEditingItem, quantity)}
                      onRemove={() => handleRemoveItem(currentEditingItem)}
                      onUpdateOptions={(menuOptionId, optionChoiceId, price) => {
                        handleUpdateOptions(currentEditingItem, menuOptionId, optionChoiceId);
                      }}
                      onUpdateNotes={(notes) => handleUpdateNotes(currentEditingItem, notes)}
                      exitOnDone={() => setCurrentEditingItem(null)}
                      exitOnCancel={() => setCurrentEditingItem(null)}
                    />
                  ) : (
                    <ScrollArea className="h-[calc(100vh-450px)]">
                      <div>
                        {cart.map((item, index) => (
                          <SimplifiedCartItem
                            key={index}
                            item={item}
                            onUpdateQuantity={(quantity) => handleUpdateQuantity(index, quantity)}
                            onRemove={() => handleRemoveItem(index)}
                            onCustomize={() => setCurrentEditingItem(index)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col border-t pt-4">
              <div className="w-full flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>£{calculateTotal().toFixed(2)}</span>
              </div>
              <Button
                className="w-full font-semibold"
                size="lg"
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleSubmitOrder}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="mr-2 h-5 w-5" />
                    Place Order
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

const NewOrderFormContainer = () => {
  return (
    <ErrorBoundary>
      <NewOrderForm />
    </ErrorBoundary>
  );
};

export default NewOrderFormContainer;