import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/hooks/useSettings';
import { Building, Palette, FileText, Bell } from 'lucide-react';

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

// Type guard functions
const isCompanyInfo = (obj: any): obj is CompanyInfo => {
  return obj && typeof obj === 'object' && 
    'name' in obj && 'address' in obj && 'phone' in obj && 'email' in obj;
};

const isInvoiceSettings = (obj: any): obj is InvoiceSettings => {
  return obj && typeof obj === 'object' &&
    'prefix' in obj && 'start_number' in obj && 'tax_rate' in obj;
};

const isThemeSettings = (obj: any): obj is ThemeSettings => {
  return obj && typeof obj === 'object' &&
    'primary_color' in obj && 'secondary_color' in obj;
};

const isNotificationSettings = (obj: any): obj is NotificationSettings => {
  return obj && typeof obj === 'object' &&
    'low_stock_alerts' in obj && 'sale_notifications' in obj;
};

const CustomizationSettings = () => {
  const { settings, getSetting, updateSetting, isUpdating } = useSettings();
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const setting = getSetting('company_info');
    const defaultValue: CompanyInfo = {
      name: 'Your Company',
      address: '123 Business St',
      phone: '+1-555-0123',
      email: 'info@company.com',
      website: 'www.company.com',
      logo_url: ''
    };
    
    if (setting?.setting_value && isCompanyInfo(setting.setting_value)) {
      return { ...defaultValue, ...setting.setting_value };
    }
    return defaultValue;
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const setting = getSetting('invoice_settings');
    const defaultValue: InvoiceSettings = {
      prefix: 'INV',
      start_number: 1001,
      tax_rate: 0.0875,
      currency: 'USD',
      due_days: 30
    };
    
    if (setting?.setting_value && isInvoiceSettings(setting.setting_value)) {
      return { ...defaultValue, ...setting.setting_value };
    }
    return defaultValue;
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const setting = getSetting('theme_settings');
    const defaultValue: ThemeSettings = {
      primary_color: '#3b82f6',
      secondary_color: '#64748b',
      accent_color: '#f59e0b',
      dark_mode: false
    };
    
    if (setting?.setting_value && isThemeSettings(setting.setting_value)) {
      return { ...defaultValue, ...setting.setting_value };
    }
    return defaultValue;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const setting = getSetting('notification_settings');
    const defaultValue: NotificationSettings = {
      low_stock_alerts: true,
      sale_notifications: true,
      email_notifications: false
    };
    
    if (setting?.setting_value && isNotificationSettings(setting.setting_value)) {
      return { ...defaultValue, ...setting.setting_value };
    }
    return defaultValue;
  });

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'start_number' ? parseInt(value, 10) : parseFloat(value);
    setInvoiceSettings(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleThemeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setThemeSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const updateCompanyInfo = () => {
    updateSetting({ key: 'company_info', value: companyInfo });
  };

  const updateInvoiceSettings = () => {
    updateSetting({ key: 'invoice_settings', value: invoiceSettings });
  };

  const updateThemeSettings = () => {
    updateSetting({ key: 'theme_settings', value: themeSettings });
  };

  const updateNotificationSettings = () => {
    updateSetting({ key: 'notification_settings', value: notificationSettings });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customization Settings</h1>
        <p className="text-gray-600">Configure your application settings and preferences</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Name</Label>
                  <Input
                    id="company-name"
                    name="name"
                    value={companyInfo.name}
                    onChange={handleCompanyInfoChange}
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    name="phone"
                    value={companyInfo.phone}
                    onChange={handleCompanyInfoChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company-address">Address</Label>
                <Input
                  id="company-address"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyInfoChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    name="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={handleCompanyInfoChange}
                  />
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    name="website"
                    value={companyInfo.website}
                    onChange={handleCompanyInfoChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company-logo">Logo URL</Label>
                <Input
                  id="company-logo"
                  name="logo_url"
                  value={companyInfo.logo_url}
                  onChange={handleCompanyInfoChange}
                />
              </div>
              <Button onClick={updateCompanyInfo} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Company Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure your invoice preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-prefix">Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    name="prefix"
                    value={invoiceSettings.prefix}
                    onChange={handleInvoiceSettingsChange}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-start-number">Start Number</Label>
                  <Input
                    id="invoice-start-number"
                    name="start_number"
                    type="number"
                    value={invoiceSettings.start_number}
                    onChange={handleInvoiceSettingsChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-tax-rate">Tax Rate</Label>
                  <Input
                    id="invoice-tax-rate"
                    name="tax_rate"
                    type="number"
                    step="0.01"
                    value={invoiceSettings.tax_rate}
                    onChange={handleInvoiceSettingsChange}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-currency">Currency</Label>
                  <Input
                    id="invoice-currency"
                    name="currency"
                    value={invoiceSettings.currency}
                    onChange={handleInvoiceSettingsChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invoice-due-days">Due Days</Label>
                <Input
                  id="invoice-due-days"
                  name="due_days"
                  type="number"
                  value={invoiceSettings.due_days}
                  onChange={handleInvoiceSettingsChange}
                />
              </div>
              <Button onClick={updateInvoiceSettings} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Invoice Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize your application theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme-primary-color">Primary Color</Label>
                  <Input
                    id="theme-primary-color"
                    name="primary_color"
                    type="color"
                    value={themeSettings.primary_color}
                    onChange={handleThemeSettingsChange}
                  />
                </div>
                <div>
                  <Label htmlFor="theme-secondary-color">Secondary Color</Label>
                  <Input
                    id="theme-secondary-color"
                    name="secondary_color"
                    type="color"
                    value={themeSettings.secondary_color}
                    onChange={handleThemeSettingsChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="theme-accent-color">Accent Color</Label>
                <Input
                  id="theme-accent-color"
                  name="accent_color"
                  type="color"
                  value={themeSettings.accent_color}
                  onChange={handleThemeSettingsChange}
                />
              </div>
              <div>
                <Label htmlFor="theme-dark-mode">Dark Mode</Label>
                <Switch
                  id="theme-dark-mode"
                  name="dark_mode"
                  checked={themeSettings.dark_mode}
                  onCheckedChange={(checked) => setThemeSettings(prev => ({ ...prev, dark_mode: checked }))}
                />
              </div>
              <Button onClick={updateThemeSettings} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Theme Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notification-low-stock">Low Stock Alerts</Label>
                <Switch
                  id="notification-low-stock"
                  name="low_stock_alerts"
                  checked={notificationSettings.low_stock_alerts}
                  onCheckedChange={handleNotificationSettingsChange}
                />
              </div>
              <div>
                <Label htmlFor="notification-sale">Sale Notifications</Label>
                <Switch
                  id="notification-sale"
                  name="sale_notifications"
                  checked={notificationSettings.sale_notifications}
                  onCheckedChange={handleNotificationSettingsChange}
                />
              </div>
              <div>
                <Label htmlFor="notification-email">Email Notifications</Label>
                <Switch
                  id="notification-email"
                  name="email_notifications"
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={handleNotificationSettingsChange}
                />
              </div>
              <Button onClick={updateNotificationSettings} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomizationSettings;
