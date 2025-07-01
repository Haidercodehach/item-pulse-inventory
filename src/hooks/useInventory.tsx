
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];
type Category = Database['public']['Tables']['categories']['Row'];
type Transaction = Database['public']['Tables']['inventory_transactions']['Row'];

export const useInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch inventory items
  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError
  } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      console.log('Fetching inventory items...');
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }
      console.log('Inventory items fetched successfully:', data);
      return data as (InventoryItem & {
        categories: { name: string } | null;
      })[];
    },
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      console.log('Categories fetched successfully:', data);
      return data as Category[];
    },
  });

  // Remove suppliers entirely as they don't exist in the current schema
  const suppliers: any[] = [];
  const suppliersLoading = false;

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['inventory-transactions'],
    queryFn: async () => {
      console.log('Fetching inventory transactions...');
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          inventory_items(name, sku)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching inventory transactions:', error);
        throw error;
      }
      console.log('Inventory transactions fetched successfully:', data);
      return data as (Transaction & {
        inventory_items: { name: string; sku: string } | null;
      })[];
    },
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (item: InventoryItemInsert) => {
      console.log('Creating item with data:', item);
      
      // Ensure required fields are present
      if (!item.name || !item.sku) {
        throw new Error('Name and SKU are required fields');
      }
      
      // Clean up the data - remove empty strings and convert to null where appropriate
      const cleanItem = {
        ...item,
        category_id: item.category_id || null,
        color: item.color || null,
        condition: item.condition || null,
        storage: item.storage || null,
        ram: item.ram || null,
        quantity: item.quantity || 0,
        min_stock_level: item.min_stock_level || 0,
        price: item.price || 0,
        cost: item.cost || 0,
      };
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(cleanItem)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating item:', error);
        throw error;
      }
      
      console.log('Item created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Success",
        description: "Item created successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Create mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: InventoryItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Success",
        description: "Item updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete item mutation - Updated to allow deletion of sold items with cascading deletions
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete item with ID:', id);
      
      // Delete sale_items that reference this inventory item first
      const { error: saleItemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('item_id', id);
      
      if (saleItemsError) {
        console.error('Error deleting sale items:', saleItemsError);
        throw new Error('Failed to delete related sale items');
      }
      
      // Delete inventory transactions that reference this item
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .delete()
        .eq('item_id', id);
      
      if (transactionError) {
        console.error('Error deleting transactions:', transactionError);
        throw new Error('Failed to delete item transactions');
      }
      
      // Finally delete the inventory item
      const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting item:', deleteError);
        throw deleteError;
      }
      
      console.log('Item and all related records deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantityChange,
      transactionType,
      unitCost,
      referenceNumber,
      notes
    }: {
      itemId: string;
      quantityChange: number;
      transactionType: Database['public']['Enums']['transaction_type'];
      unitCost?: number;
      referenceNumber?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.rpc('update_inventory_quantity', {
        item_id: itemId,
        quantity_change: quantityChange,
        transaction_type_param: transactionType,
        unit_cost_param: unitCost,
        reference_number_param: referenceNumber,
        notes_param: notes,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      toast({
        title: "Success",
        description: "Inventory updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    items,
    categories,
    suppliers,
    transactions,
    isLoading: itemsLoading || categoriesLoading,
    itemsLoading,
    categoriesLoading,
    suppliersLoading,
    transactionsLoading,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
  };
};
