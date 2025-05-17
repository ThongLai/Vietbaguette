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

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  options: {
    name: string;
    choice: string;
    extraPrice?: number;
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
    total + (opt.extraPrice || 0) * item.quantity, 0);
  const totalPrice = basePrice + optionsPrice;

  return (
    <div className="border rounded-md p-3 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{item.menuItem.name}</h4>
          <p className="text-sm text-muted-foreground">
            £{item.menuItem.price.toFixed(2)} each
          </p>
        </div>
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-2 font-medium">{item.quantity}</span>
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

      {item.options.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium">Selected Options:</p>
          <ul className="text-sm text-muted-foreground">
            {item.options.map((option, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{option.name}: {option.choice}</span>
                {option.extraPrice ? <span>+£{option.extraPrice.toFixed(2)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.notes && (
        <div className="mt-2">
          <p className="text-sm font-medium">Notes:</p>
          <p className="text-sm text-muted-foreground italic">{item.notes}</p>
        </div>
      )}

      <div className="mt-3 flex justify-between items-center">
        <p className="font-medium">
          Total: £{totalPrice.toFixed(2)}
        </p>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? 'Hide Options' : 'Options'}
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showOptions && (
        <div className="mt-3 pt-3 border-t">
          {/* Options selectors */}
          {item.menuItem.options && item.menuItem.options.length > 0 && (
            <div className="space-y-3">
              {item.menuItem.options.map((option) => (
                <div key={option.name} className="grid gap-2">
                  <Label htmlFor={`option-${option.name}`}>{option.name}</Label>
                  <Select
                    value={item.options.find(o => o.name === option.name)?.choice || ''}
                    onValueChange={(value) => {
                      const choice = option.choices.find(c => c.name === value);
                      onUpdateOptions(option.name, value, choice?.price);
                    }}
                  >
                    <SelectTrigger id={`option-${option.name}`}>
                      <SelectValue placeholder={`Select ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.choices.map((choice) => (
                        <SelectItem key={choice.name} value={choice.name}>
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
          <div className="mt-3">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests?"
              value={item.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const NewOrderForm = () => {
  const { menu, addOrder } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group menu items by category
  const categories = [...new Set(menu.map(item => item.category))];
  const menuByCategory: Record<string, MenuItem[]> = {};
  
  categories.forEach(category => {
    menuByCategory[category] = menu.filter(item => item.category === category);
  });

  const handleAddToCart = (menuItem: MenuItem) => {
    // Create default options if the menu item has options
    const defaultOptions = menuItem.options ? menuItem.options.map(option => ({
      name: option.name,
      choice: option.choices[0].name,
      extraPrice: option.choices[0].price,
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

  const handleUpdateOptions = (index: number, optionName: string, choice: string, price?: number) => {
    const updatedCart = [...cart];
    const currentItem = updatedCart[index];
    
    // Find if this option already exists
    const optionIndex = currentItem.options.findIndex(opt => opt.name === optionName);
    
    if (optionIndex >= 0) {
      // Update existing option
      currentItem.options[optionIndex] = {
        name: optionName,
        choice,
        extraPrice: price,
      };
    } else {
      // Add new option
      currentItem.options.push({
        name: optionName,
        choice,
        extraPrice: price,
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
        sum + (opt.extraPrice || 0) * item.quantity, 0);
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

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          menuItem: item.menuItem,
          quantity: item.quantity,
          notes: item.notes || '',
          options: item.options,
          status: 'pending' as const,
        })),
        tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
        customerName: customerName || undefined,
        total: calculateTotal(),
      };

      // Add the order
      await addOrder(orderData);

      // Reset form
      setCart([]);
      setTableNumber('');
      setCustomerName('');

      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed.",
      });
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
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <ScrollArea className="w-full">
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              <TabsContent value="all">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {categories.map((category) => (
                    <CategorySection
                      key={category}
                      title={category.charAt(0).toUpperCase() + category.slice(1)}
                      items={menuByCategory[category]}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <CategorySection
                      title={category.charAt(0).toUpperCase() + category.slice(1)}
                      items={menuByCategory[category]}
                      onAddToCart={handleAddToCart}
                    />
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Section */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Customer Info */}
              <div className="grid gap-2">
                <Label htmlFor="tableNumber">Table Number (optional)</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name (optional)</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              {/* Cart Items */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Items ({cart.length})</h3>
                
                {cart.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    No items added yet
                  </p>
                ) : (
                  <ScrollArea className="h-[calc(100vh-500px)]">
                    {cart.map((item, index) => (
                      <CartItemComponent
                        key={index}
                        item={item}
                        onUpdateQuantity={(quantity) => handleUpdateQuantity(index, quantity)}
                        onRemove={() => handleRemoveItem(index)}
                        onUpdateOptions={(optionName, choice, price) => 
                          handleUpdateOptions(index, optionName, choice, price)
                        }
                        onUpdateNotes={(notes) => handleUpdateNotes(index, notes)}
                      />
                    ))}
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
              className="w-full" 
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

export default NewOrderForm; 