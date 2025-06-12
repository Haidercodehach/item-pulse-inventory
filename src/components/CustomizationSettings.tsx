
import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Building, Receipt, Bell } from 'lucide-react';

// Define proper types for settings
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
  const { settings, getSetting, updateSetting, isUpdating } = useSettings();
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const setting = getSetting('company_info');
    const defaultValue = {
      name: 'Your Company',
      address: '123 Business St',
      phone: '+1-555-0123',
      email: 'info@company.com',
      website: 'www.company.com',
      logo_url: ''
    };
    return setting?.setting_value ? { ...defaultValue, ...(setting.setting_value as CompanyInfo) } : defaultValue;
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const setting = getSetting('invoice_settings');
    const defaultValue = {
      prefix: 'INV',
      start_number: 1001,
      tax_rate: 0.0875,
      currency: 'USD',
      due_days: 30
    };
    return setting?.setting_value ? { ...defaultValue, ...(setting.setting_value as InvoiceSettings) } : defaultValue;
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const setting = getSetting('theme_settings');
    const defaultValue = {
      primary_color: '#3b82f6',
      secondary_color: '#64748b',
      accent_color: '#f59e0b',
      dark_mode: false
    };
    return setting?.setting_value ? { ...defaultValue, ...(setting.setting_value as ThemeSettings) } : defaultValue;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const setting = getSetting('notification_settings');
    const defaultValue = {
      low_stock_alerts: true,
      sale_notifications: true,
      email_notifications: false
    };
    return setting?.setting_value ? { ...defaultValue, ...(setting.setting_value as NotificationSettings) } : defaultValue;
  });

  const handleSaveCompanyInfo = () => {
    updateSetting({ key: 'company_info', value: companyInfo });
  };

  const handleSaveInvoiceSettings = () => {
    updateSetting({ key: 'invoice_settings', value: invoiceSettings });
  };

  const handleSaveThemeSettings = () => {
    updateSetting({ key: 'theme_settings', value: themeSettings });
  };

  const handleSaveNotificationSettings = () => {
    updateSetting({ key: 'notification_settings', value: notificationSettings });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customization Settings</h1>
        <p className="text-gray-600">Customize your application settings and preferences</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="company-logo">Logo URL</Label>
                <Input
                  id="company-logo"
                  value={companyInfo.logo_url}
                  onChange={(e) => setCompanyInfo({...companyInfo, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <Button onClick={handleSaveCompanyInfo} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Company Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={invoiceSettings.prefix}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, prefix: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="start-number">Starting Number</Label>
                  <Input
                    id="start-number"
                    type="number"
                    value={invoiceSettings.start_number}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, start_number: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.0001"
                    value={(invoiceSettings.tax_rate * 100).toFixed(4)}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, tax_rate: parseFloat(e.target.value) / 100})}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={invoiceSettings.currency}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, currency: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="due-days">Payment Due Days</Label>
                  <Input
                    id="due-days"
                    type="number"
                    value={invoiceSettings.due_days}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, due_days: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveInvoiceSettings} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Invoice Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings({...themeSettings, primary_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings({...themeSettings, primary_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={themeSettings.secondary_color}
                      onChange={(e) => setThemeSettings({...themeSettings, secondary_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={themeSettings.secondary_color}
                      onChange={(e) => setThemeSettings({...themeSettings, secondary_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings({...themeSettings, accent_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings({...themeSettings, accent_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={themeSettings.dark_mode}
                  onCheckedChange={(checked) => setThemeSettings({...themeSettings, dark_mode: checked})}
                />
                <Label htmlFor="dark-mode">Enable Dark Mode</Label>
              </div>
              <Button onClick={handleSaveThemeSettings} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Theme Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="low-stock-alerts"
                    checked={notificationSettings.low_stock_alerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, low_stock_alerts: checked})}
                  />
                  <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sale-notifications"
                    checked={notificationSettings.sale_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, sale_notifications: checked})}
                  />
                  <Label htmlFor="sale-notifications">Sale Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_notifications: checked})}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
              </div>
              <Button onClick={handleSaveNotificationSettings} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomizationSettings;
