import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useInventory } from "@/hooks/useInventory";
import { Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category_id: z.string().optional(),
  color: z.string().optional(),
  condition: z.string().optional(),
  storage: z.string().optional(),
  seller: z.string().optional(),
  status: z.enum(["available", "sold"]),
  price: z.number().min(0, "Price cannot be negative"),
  cost: z.number().min(0, "Cost cannot be negative"),
  quantity: z.number().optional(),
  purchase_date: z.date().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  item?: any;
  onSuccess: () => void;
  categories: any[];
  suppliers: any[];
}

const ItemForm = ({ item, onSuccess, categories }: ItemFormProps) => {
  const { createItem, updateItem, isCreating, isUpdating } = useInventory();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      sku: "",
      category_id: "",
      color: "",
      condition: "",
      storage: "",
      seller: "",
      status: "available" as const,
      price: 0,
      cost: 0,
      quantity: 1,
      purchase_date: undefined,
    },
  });

  useEffect(() => {
    if (item) {
      console.log("Setting form values for item:", item);
      form.reset({
        name: item.name || "",
        sku: item.sku || "",
        category_id: item.category_id || "",
        color: item.color || "",
        condition: item.condition || "",
        storage: item.storage || "",
        seller: item.seller || "",
        status: item.status || "available",
        price: item.price || 0,
        cost: item.cost || 0,
        purchase_date: item.purchase_date ? new Date(item.purchase_date) : undefined,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: ItemFormData) => {
    try {
      console.log("Form submission data:", data);

      // Ensure name and sku are provided as strings, not optional
      const itemData = {
        name: data.name.trim(),
        sku: data.sku.trim().toUpperCase(), // Standardize SKU format
        category_id: data.category_id || undefined,
        color: data.color?.trim() || undefined,
        condition: data.condition?.trim() || undefined,
        storage: data.storage?.trim() || undefined,
        seller: data.seller?.trim() || undefined,
        status: data.status,
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        quantity: data.status === "available" ? 1 : 0,
        purchase_date: data.purchase_date ? data.purchase_date.toISOString().split('T')[0] : undefined,
      };

      console.log("Processed item data:", itemData);

      if (item) {
        updateItem({ id: item.id, ...itemData });
      } else {
        createItem(itemData);
      }
      onSuccess();
      if (!item) {
        form.reset();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Item name"
                    {...field}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">SKU *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Stock Keeping Unit"
                    {...field}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Color</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Item color"
                    {...field}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Condition</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Item condition"
                    {...field}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Storage</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Storage capacity"
                    {...field}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seller"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Seller</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Company name or Private"
                    {...field}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                          !field.value && "text-white/60"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Status *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="available"
                        id="available"
                        className="border-white text-white"
                      />
                      <label
                        htmlFor="available"
                        className="text-white text-sm font-medium cursor-pointer"
                      >
                        Available
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="sold"
                        id="sold"
                        className="border-white text-white"
                      />
                      <label
                        htmlFor="sold"
                        className="text-white text-sm font-medium cursor-pointer"
                      >
                        Sold
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Selling Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Cost Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-white text-primary hover:bg-white/90"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {item ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ItemForm;
