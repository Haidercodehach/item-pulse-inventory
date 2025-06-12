
import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Building, Palette, Bell, FileText, Sparkles } from 'lucide-react';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
}

interface InvoiceSettings {
  prefix: string;
  start_number: number;
  tax_rate: number;
  currency: string;
  due_days: number;
}

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  dark_mode: boolean;
}

interface NotificationSettings {
  low_stock_alerts: boolean;
  sale_notifications: boolean;
  email_notifications: boolean;
}

const CustomizationSettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  const { toast } = useToast();

  // Helper function to safely parse and get settings with defaults
  const getCompanyInfo = (): CompanyInfo => {
    const companySetting = settings.find(s => s.setting_key === 'company_info');
    if (companySetting?.setting_value && typeof companySetting.setting_value === 'object' && !Array.isArray(companySetting.setting_value)) {
      return companySetting.setting_value as CompanyInfo;
    }
    return {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo_url: ''
    };
  };

  const getInvoiceSettings = (): InvoiceSettings => {
    const invoiceSetting = settings.find(s => s.setting_key === 'invoice_settings');
    if (invoiceSetting?.setting_value && typeof invoiceSetting.setting_value === 'object' && !Array.isArray(invoiceSetting.setting_value)) {
      return invoiceSetting.setting_value as InvoiceSettings;
    }
    return {
      prefix: 'INV',
      start_number: 1000,
      tax_rate: 0,
      currency: 'USD',
      due_days: 30
    };
  };

  const getThemeSettings = (): ThemeSettings => {
    const themeSetting = settings.find(s => s.setting_key === 'theme_settings');
    if (themeSetting?.setting_value && typeof themeSetting.setting_value === 'object' && !Array.isArray(themeSetting.setting_value)) {
      return themeSetting.setting_value as ThemeSettings;
    }
    return {
      primary_color: '#3B82F6',
      secondary_color: '#6B7280',
      accent_color: '#8B5CF6',
      dark_mode: false
    };
  };

  const getNotificationSettings = (): NotificationSettings => {
    const notificationSetting = settings.find(s => s.setting_key === 'notification_settings');
    if (notificationSetting?.setting_value && typeof notificationSetting.setting_value === 'object' && !Array.isArray(notificationSetting.setting_value)) {
      return notificationSetting.setting_value as NotificationSettings;
    }
    return {
      low_stock_alerts: true,
      sale_notifications: true,
      email_notifications: false
    };
  };

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(getCompanyInfo());
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(getInvoiceSettings());
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(getThemeSettings());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings());

  useEffect(() => {
    setCompanyInfo(getCompanyInfo());
    setInvoiceSettings(getInvoiceSettings());
    setThemeSettings(getThemeSettings());
    setNotificationSettings(getNotificationSettings());
  }, [settings]);

  const handleCompanyInfoSave = async () => {
    await updateSetting('company_info', companyInfo);
    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
  };

  const handleInvoiceSettingsSave = async () => {
    await updateSetting('invoice_settings', invoiceSettings);
    toast({
      title: "Success",
      description: "Invoice settings updated successfully",
    });
  };

  const handleThemeSettingsSave = async () => {
    await updateSetting('theme_settings', themeSettings);
    toast({
      title: "Success",
      description: "Theme settings updated successfully",
    });
  };

  const handleNotificationSettingsSave = async () => {
    await updateSetting('notification_settings', notificationSettings);
    toast({
      title: "Success",
      description: "Notification settings updated successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-vibrant">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center glass">
            <Sparkles className="w-8 h-8 text-white animate-float" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6 animate-fade-in">
        <div className="bg-gradient-cool rounded-2xl p-8 text-white animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Palette className="w-8 h-8 animate-float" />
            Customization Settings
          </h1>
          <p className="text-white/80">Configure your application settings and preferences</p>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <TabsTrigger value="company" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <Building className="w-4 h-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="invoice" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <FileText className="w-4 h-4 mr-2" />
              Invoice
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription className="text-white/80">
                  Configure your company details for invoices and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name" className="text-white">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email" className="text-white">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone" className="text-white">Phone</Label>
                    <Input
                      id="company-phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-website" className="text-white">Website</Label>
                    <Input
                      id="company-website"
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="www.company.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-address" className="text-white">Address</Label>
                  <Input
                    id="company-address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                    placeholder="123 Business St, City, State 12345"
                  />
                </div>
                <div>
                  <Label htmlFor="company-logo" className="text-white">Logo URL</Label>
                  <Input
                    id="company-logo"
                    value={companyInfo.logo_url}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, logo_url: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <Button 
                  onClick={handleCompanyInfoSave}
                  className="w-full bg-white text-primary hover:bg-white/90 hover-lift"
                >
                  Save Company Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice Settings
                </CardTitle>
                <CardDescription className="text-white/80">
                  Configure invoice numbering and formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice-prefix" className="text-white">Invoice Prefix</Label>
                    <Input
                      id="invoice-prefix"
                      value={invoiceSettings.prefix}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="INV"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-number" className="text-white">Starting Number</Label>
                    <Input
                      id="start-number"
                      type="number"
                      value={invoiceSettings.start_number}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, start_number: parseInt(e.target.value) || 1000 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax-rate" className="text-white">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.01"
                      value={invoiceSettings.tax_rate}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="8.25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-white">Currency</Label>
                    <Input
                      id="currency"
                      value={invoiceSettings.currency}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, currency: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-days" className="text-white">Payment Due Days</Label>
                    <Input
                      id="due-days"
                      type="number"
                      value={invoiceSettings.due_days}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, due_days: parseInt(e.target.value) || 30 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      placeholder="30"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleInvoiceSettingsSave}
                  className="w-full bg-white text-primary hover:bg-white/90 hover-lift"
                >
                  Save Invoice Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme Settings
                </CardTitle>
                <CardDescription className="text-white/80">
                  Customize the appearance of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary-color" className="text-white">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings({ ...themeSettings, primary_color: e.target.value })}
                      className="bg-white/10 border-white/20 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary-color" className="text-white">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={themeSettings.secondary_color}
                      onChange={(e) => setThemeSettings({ ...themeSettings, secondary_color: e.target.value })}
                      className="bg-white/10 border-white/20 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent-color" className="text-white">Accent Color</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings({ ...themeSettings, accent_color: e.target.value })}
                      className="bg-white/10 border-white/20 h-12"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dark-mode"
                    checked={themeSettings.dark_mode}
                    onCheckedChange={(checked) => setThemeSettings({ ...themeSettings, dark_mode: checked })}
                  />
                  <Label htmlFor="dark-mode" className="text-white">Dark Mode</Label>
                </div>
                <Button 
                  onClick={handleThemeSettingsSave}
                  className="w-full bg-white text-primary hover:bg-white/90 hover-lift"
                >
                  Save Theme Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-white/80">
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass rounded-lg border-white/20">
                    <div>
                      <Label htmlFor="low-stock" className="text-white font-medium">Low Stock Alerts</Label>
                      <p className="text-sm text-white/70">Get notified when items are running low</p>
                    </div>
                    <Switch
                      id="low-stock"
                      checked={notificationSettings.low_stock_alerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, low_stock_alerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 glass rounded-lg border-white/20">
                    <div>
                      <Label htmlFor="sale-notifications" className="text-white font-medium">Sale Notifications</Label>
                      <p className="text-sm text-white/70">Get notified about new sales</p>
                    </div>
                    <Switch
                      id="sale-notifications"
                      checked={notificationSettings.sale_notifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sale_notifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 glass rounded-lg border-white/20">
                    <div>
                      <Label htmlFor="email-notifications" className="text-white font-medium">Email Notifications</Label>
                      <p className="text-sm text-white/70">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleNotificationSettingsSave}
                  className="w-full bg-white text-primary hover:bg-white/90 hover-lift"
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomizationSettings;
