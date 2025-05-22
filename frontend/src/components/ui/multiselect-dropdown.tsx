import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  options: { label: string; value: string; price?: number }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const maxToShow = 2;
  let selectedLabels = selectedOptions.map((opt) => opt.label);
  let displayText = "";
  if (selectedLabels.length <= maxToShow) {
    displayText = selectedLabels.join(", ");
  } else {
    displayText =
      selectedLabels.slice(0, maxToShow).join(", ") +
      `, ... (+${selectedLabels.length - maxToShow} more)`;
  }

  return (
    <div className="w-full">
      {label && <span className="block mb-1 text-sm font-medium">{label}</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal h-10 px-3 py-2 border rounded-md",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className={cn(!selectedLabels.length && "text-muted-foreground")}
              title={selectedLabels.join(", ")}
            >
              {displayText || placeholder}
            </span>
            <svg
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-64 max-w-full">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "flex items-center w-full px-2 py-2 rounded hover:bg-accent text-sm transition-colors",
                  value.includes(opt.value) && "bg-accent/50"
                )}
                onClick={() => handleToggle(opt.value)}
              >
                <span className="flex items-center gap-2 flex-1">
                  <span className="inline-flex items-center">
                    <span
                      className={cn(
                        "inline-block w-4 h-4 mr-2 border rounded-sm flex items-center justify-center",
                        value.includes(opt.value)
                          ? "bg-primary border-primary"
                          : "bg-background border-muted"
                      )}
                    >
                      {value.includes(opt.value) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </span>
                    {opt.label}
                  </span>
                  {typeof opt.price === "number" && opt.price !== 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {opt.price > 0 ? "+" : ""}£{opt.price.toFixed(2)}
                    </span>
                  )}
                </span>
              </button>
            ))}
            {options.length === 0 && (
              <div className="text-muted-foreground text-sm px-2 py-2">No options</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 