import React from 'react';
import type { CartItem } from './NewOrderForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onUpdateOptions: (optionName: string, choice: string, price?: number) => void;
  onUpdateNotes: (notes: string) => void;
}

export const CartItemComponent: React.FC<CartItemComponentProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onUpdateOptions,
  onUpdateNotes,
}) => {
  const [showOptions, setShowOptions] = React.useState(false);

  // Calculate total price for this item including options
  const calculateItemTotal = () => {
    const basePrice = item.menuItem.price * item.quantity;
    const optionsPrice = item.options.reduce(
      (sum, opt) => sum + (opt.optionChoice.price || 0) * item.quantity,
      0
    );
    return basePrice + optionsPrice;
  };

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Header with name and quantity controls */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <h4 className="font-medium">{item.menuItem.name}</h4>
            {item.menuItem.namevi && (
              <p className="text-sm text-muted-foreground italic">{item.menuItem.namevi}</p>
            )}
          </div>
          
          {/* Quantity controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

        {/* Price information */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-medium">£{calculateItemTotal().toFixed(2)}</span>
          {item.options.length > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                +£{(item.options.reduce((sum, opt) => sum + (opt.optionChoice.price || 0), 0)).toFixed(2)} in options
              </p>
            </>
          )}
        </div>

        {/* Options and Customization */}
        {item.menuItem.options && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 h-8 hover:bg-transparent hover:underline"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Hide options' : 'Show options'}
            </Button>

            {showOptions && (
              <div className="mt-4 space-y-4">
                {item.menuItem.options.map((option) => (
                  <div key={option.id} className="grid gap-1.5">
                    <Label htmlFor={`option-${option.id}`}>{option.name}</Label>
                    <Select
                      value={item.options.find(o => o.menuOption.id === option.id)?.optionChoice.id}
                      onValueChange={(value) => {
                        const choice = option.choices.find(c => c.id === value);
                        if (choice) {
                          onUpdateOptions(option.name, choice.name, choice.price);
                        }
                      }}
                    >
                      <SelectTrigger id={`option-${option.id}`}>
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
          </div>
        )}

        {/* Notes */}
        {showOptions && (
          <div className="mt-4">
            <Label htmlFor={`notes-${item.menuItem.id}`}>Special Instructions</Label>
            <Textarea
              id={`notes-${item.menuItem.id}`}
              placeholder="Any special requests?"
              value={item.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              className="mt-1.5 resize-none"
              rows={2}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
