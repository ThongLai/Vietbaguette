import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Pencil, Trash2, Leaf, PlusSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface OptionChoice {
  id?: string;
  name: string;
  price?: number;
}

interface MenuOption {
  id?: string;
  name: string;
  choices: OptionChoice[];
}

interface MenuItem {
  id?: string;
  name: string;
  nameVi?: string;
  price: number;
  description?: string;
  image?: string;
  category: string;
  vegetarian: boolean;
  options?: MenuOption[];
}

const CATEGORIES = [
  'starters',
  'main',
  'sides',
  'sauces',
  'drinks',
  'coffee',
  'bubble_tea'
];

const MenuManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    nameVi: '',
    price: 0,
    description: '',
    image: '',
    category: 'starters',
    vegetarian: false,
    options: []
  });
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      navigate('/dashboard');
    } else if (!isLoading && isAuthenticated) {
      fetchMenuItems();
    }
  }, [isAuthenticated, isLoading, navigate, user]);
  
  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch('/api/menu', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, price: isNaN(value) ? 0 : value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  const handleVegetarianToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, vegetarian: checked }));
  };
  
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), { name: '', choices: [{ name: '', price: undefined }] }]
    }));
  };
  
  const updateOption = (index: number, name: string) => {
    setFormData(prev => {
      const options = [...(prev.options || [])];
      options[index] = { ...options[index], name };
      return { ...prev, options };
    });
  };
  
  const addChoice = (optionIndex: number) => {
    setFormData(prev => {
      const options = [...(prev.options || [])];
      options[optionIndex].choices.push({ name: '', price: undefined });
      return { ...prev, options };
    });
  };
  
  const updateChoice = (optionIndex: number, choiceIndex: number, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => {
      const options = [...(prev.options || [])];
      if (field === 'name') {
        options[optionIndex].choices[choiceIndex].name = value as string;
      } else {
        options[optionIndex].choices[choiceIndex].price = value as number;
      }
      return { ...prev, options };
    });
  };
  
  const removeOption = (index: number) => {
    setFormData(prev => {
      const options = [...(prev.options || [])];
      options.splice(index, 1);
      return { ...prev, options };
    });
  };
  
  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    setFormData(prev => {
      const options = [...(prev.options || [])];
      options[optionIndex].choices.splice(choiceIndex, 1);
      return { ...prev, options };
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      nameVi: '',
      price: 0,
      description: '',
      image: '',
      category: 'starters',
      vegetarian: false,
      options: []
    });
    setSelectedItem(null);
  };
  
  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      options: item.options || []
    });
    setDialogOpen(true);
  };
  
  const handleDelete = async (id?: string) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }
      
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
      
      // Refresh menu items
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Form validation
      if (!formData.name || formData.price <= 0 || !formData.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate that options have names and choices
      if (formData.options && formData.options.length > 0) {
        for (const option of formData.options) {
          if (!option.name || option.choices.length === 0) {
            toast({
              title: "Validation Error",
              description: "All options must have a name and at least one choice",
              variant: "destructive"
            });
            setIsSubmitting(false);
            return;
          }
          
          for (const choice of option.choices) {
            if (!choice.name) {
              toast({
                title: "Validation Error",
                description: "All choices must have a name",
                variant: "destructive"
              });
              setIsSubmitting(false);
              return;
            }
          }
        }
      }
      
      const method = selectedItem ? 'PUT' : 'POST';
      const url = selectedItem ? `/api/menu/${selectedItem.id}` : '/api/menu';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('viet_baguette_token')}`
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${selectedItem ? 'update' : 'create'} menu item`);
      }
      
      toast({
        title: "Success",
        description: `Menu item ${selectedItem ? 'updated' : 'created'} successfully`,
      });
      
      // Reset form and refresh menu items
      resetForm();
      fetchMenuItems();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error submitting menu item:', error);
      toast({
        title: "Error",
        description: `Failed to ${selectedItem ? 'update' : 'create'} menu item`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter items by category
  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-viet-red"></div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{selectedItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (English) *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameVi">Name (Vietnamese)</Label>
                    <Input 
                      id="nameVi" 
                      name="nameVi" 
                      value={formData.nameVi || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (£) *</Label>
                    <Input 
                      id="price" 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={formData.price} 
                      onChange={handlePriceChange} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input 
                    id="image" 
                    name="image" 
                    value={formData.image || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="vegetarian" 
                    checked={formData.vegetarian} 
                    onCheckedChange={handleVegetarianToggle}
                  />
                  <Label htmlFor="vegetarian" className="flex items-center">
                    <Leaf className="mr-2 h-4 w-4 text-green-600" />
                    Vegetarian
                  </Label>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Options</h3>
                    <Button type="button" variant="outline" onClick={addOption}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                  
                  {formData.options && formData.options.map((option, optionIndex) => (
                    <Card key={optionIndex} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1 mr-4">
                            <Label htmlFor={`option-name-${optionIndex}`}>Option Name</Label>
                            <Input 
                              id={`option-name-${optionIndex}`}
                              value={option.name} 
                              onChange={(e) => updateOption(optionIndex, e.target.value)}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeOption(optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-medium mb-2">Choices</h4>
                        {option.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex items-end space-x-2 mb-2">
                            <div className="flex-1 space-y-1">
                              <Label htmlFor={`choice-name-${optionIndex}-${choiceIndex}`}>Name</Label>
                              <Input 
                                id={`choice-name-${optionIndex}-${choiceIndex}`}
                                value={choice.name} 
                                onChange={(e) => updateChoice(optionIndex, choiceIndex, 'name', e.target.value)}
                              />
                            </div>
                            <div className="w-24 space-y-1">
                              <Label htmlFor={`choice-price-${optionIndex}-${choiceIndex}`}>Extra £</Label>
                              <Input 
                                id={`choice-price-${optionIndex}-${choiceIndex}`}
                                type="number" 
                                step="0.01" 
                                min="0"
                                value={choice.price || ''} 
                                onChange={(e) => updateChoice(optionIndex, choiceIndex, 'price', parseFloat(e.target.value))}
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 mb-1"
                              onClick={() => removeChoice(optionIndex, choiceIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addChoice(optionIndex)}
                          className="mt-2"
                        >
                          <PlusSquare className="mr-2 h-4 w-4" />
                          Add Choice
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-100 border-t-transparent"></div>
                        {selectedItem ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{selectedItem ? 'Update' : 'Create'} Item</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>
              Manage your restaurant's menu items
            </CardDescription>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                {CATEGORIES.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No menu items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium flex items-center space-x-2">
                            {item.name}
                            {item.vegetarian && (
                              <Leaf className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          {item.nameVi && (
                            <div className="text-sm text-muted-foreground">
                              {item.nameVi}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>£{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.options && item.options.length > 0 ? (
                            <span className="text-sm">
                              {item.options.length} option{item.options.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="mr-2"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuManagement; 