
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleInsert = Database['public']['Tables']['sales']['Insert'];
type SaleItem = Database['public']['Tables']['sale_items']['Row'];

export const useSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch sales
  const {
    data: sales = [],
    isLoading: salesLoading,
  } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items(
            *,
            inventory_items(name, sku)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Sale & {
        sale_items: (SaleItem & {
          inventory_items: { name: string; sku: string } | null;
        })[];
      })[];
    },
  });

  // Process sale mutation
  const processSaleMutation = useMutation({
    mutationFn: async ({ saleData, saleItems }: {
      saleData: any;
      saleItems: any[];
    }) => {
      const { data, error } = await supabase.rpc('process_sale', {
        sale_data: saleData,
        sale_items_data: saleItems,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Success",
        description: "Sale processed successfully!",
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
    sales,
    salesLoading,
    processSale: processSaleMutation.mutate,
    isProcessing: processSaleMutation.isPending,
  };
};
