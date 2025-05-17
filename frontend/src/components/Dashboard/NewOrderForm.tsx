import { useState } from 'react';
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
import { ShoppingCart, Plus, Minus, Trash2, Check, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { normalizeCategory } from '@/lib/menu-utils';

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
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative h-32 overflow-hidden bg-muted">
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
          <Badge className="absolute top-2 right-2 bg-green-500">
            <Leaf className="h-3 w-3 mr-1" />
            Veg
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
  onUpdateNotes
}: { 
  item: CartItem; 
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onUpdateOptions: (optionName: string, choice: string, price?: number) => void;
  onUpdateNotes: (notes: string) => void;
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Calculate total price for this item
  const basePrice = item.menuItem.price * item.quantity;
  const optionsPrice = item.options.reduce((total, opt) => 
    total + (opt.optionChoice.price || 0) * item.quantity, 0);
  const totalPrice = basePrice + optionsPrice;

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        {/* Main item info */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-base">{item.menuItem.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground">
                    £{item.menuItem.price.toFixed(2)} each
                  </p>
                  {optionsPrice > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        +£{(optionsPrice / item.quantity).toFixed(2)} in options
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Options summary - only show when not expanded */}
            {!showOptions && item.options.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.options.map(opt => opt.optionChoice.name).join(', ')}
                </p>
              </div>
            )}

            {/* Notes preview - only show when not expanded */}
            {!showOptions && item.notes && (
              <div className="mt-1">
                <p className="text-sm text-muted-foreground italic line-clamp-1">
                  Note: {item.notes}
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
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Options and Notes when expanded */}
        {showOptions && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Options selectors */}
            {item.menuItem.options && item.menuItem.options.length > 0 && (
              <div className="space-y-3">
                {item.menuItem.options.map((option) => (
                  <div key={option.name} className="grid gap-1.5">
                    <Label htmlFor={`option-${option.name}`}>{option.name}</Label>
                    <Select
                      value={item.options.find(o => o.menuOption.id === option.id)?.optionChoice.id || ''}
                      onValueChange={(value) => {
                        const choice = option.choices.find(c => c.id === value);
                        onUpdateOptions(option.id, value, choice?.price);
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
                value={item.notes || ''}
                onChange={(e) => onUpdateNotes(e.target.value)}
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
            <span className="text-base">£{totalPrice.toFixed(2)}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-3 hover:bg-muted"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Done' : 'Customize'}
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
      </CardContent>
    </Card>
  );
};

const NewOrderForm = () => {
  const { menu, isMenuLoading, addOrder } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Group menu items by category
  // normalizeCategory is already imported at the top

  const categories = [...new Set(menu.map(item => item.category))].sort();
  const menuByCategory: Record<string, MenuItem[]> = {};
  
  categories.forEach(category => {
    menuByCategory[category] = menu.filter(item => item.category === category);
  });

  const handleAddToCart = (menuItem: MenuItem) => {
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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate total for the order
      const total = cart.reduce((sum, item) => {
        const basePrice = item.menuItem.price * item.quantity;
        const optionsPrice = item.options.reduce((optSum, opt) => 
          optSum + (opt.optionChoice.price || 0) * item.quantity, 0);
        return sum + basePrice + optionsPrice;
      }, 0);

      // Format order data according to the database schema
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || '',
          selectedOptions: item.options.map(opt => ({
            menuOptionId: opt.menuOption.id,
            optionChoiceId: opt.optionChoice.id,
          })),
        })),
        tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
        customerName: customerName || undefined,
        total, // Add the calculated total
      };

      // Add the order using the context function
      await addOrder(orderData);

      // Reset form
      setCart([]);
      setTableNumber('');
      setCustomerName('');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error",
        description: "Failed to place the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <CardContent>
            {isMenuLoading ? (
              <div className="space-y-8">
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
                <div className="mb-6 border-b">
                  <ScrollArea className="w-full pb-2">
                    <TabsList className="w-full h-auto justify-start inline-flex space-x-2 bg-transparent p-0">
                      <TabsTrigger
                        value="all"
                        className="rounded-full px-4 py-2 data-[state=active]:bg-primary"
                      >
                        All
                      </TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="rounded-full px-4 py-2 data-[state=active]:bg-primary whitespace-nowrap"
                        >
                          {normalizeCategory(category)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>
                </div>

                <TabsContent value="all" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-8 p-1">
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
                  <TabsContent key={category} value={category} className="mt-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="p-1">
                        <CategorySection
                          title={normalizeCategory(category)}
                          items={menuByCategory[category]}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Section */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Customer Info */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="tableNumber">Table Number (optional)</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter table number"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name (optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div>
                <h3 className="font-semibold mb-3">Items ({cart.length})</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border rounded-md">
                    <p>No items added yet</p>
                    <p className="text-sm mt-1">Select items from the menu to add them to your order</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-500px)]">
                    <div className="space-y-4 pr-4">
                      {cart.map((item, index) => (
                        <CartItemComponent
                          key={index}
                          item={item}
                          onUpdateQuantity={(quantity) => handleUpdateQuantity(index, quantity)}
                          onRemove={() => handleRemoveItem(index)}
                          onUpdateOptions={(optionName, choice, price) => {
                            const menuOption = item.menuItem.options?.find(opt => opt.name === optionName);
                            if (!menuOption) return;
                            const optionChoice = menuOption.choices.find(c => c.name === choice);
                            if (!optionChoice) return;
                            handleUpdateOptions(index, menuOption.id, optionChoice.id);
                          }}
                          onUpdateNotes={(notes) => handleUpdateNotes(index, notes)}
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