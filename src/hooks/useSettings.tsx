
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type AppSetting = Database['public']['Tables']['app_settings']['Row'];

export const useSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all settings
  const {
    data: settings = [],
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('category');
      
      if (error) throw error;
      return data as AppSetting[];
    },
  });

  // Get setting by key
  const getSetting = (key: string) => {
    return settings.find(setting => setting.setting_key === key);
  };

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully!",
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
    settings,
    settingsLoading,
    getSetting,
    updateSetting: updateSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
  };
};
