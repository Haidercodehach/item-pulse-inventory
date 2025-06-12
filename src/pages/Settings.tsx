
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Info, Bell, Palette, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomizationClick = () => {
    navigate('/customize');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Customization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and manage your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profile?.full_name || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {profile?.role || 'employee'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="member-since">Member Since</Label>
                  <Input
                    id="member-since"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Account Security</h3>
                  <p className="text-sm text-gray-600">
                    Your account is secured with email authentication through Supabase.
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign out of your account. You'll need to sign in again to access the application.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Application and system details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Application Version</Label>
                  <p className="text-sm text-gray-600">v1.0.0</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Database Status</Label>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div>
                  <Label>Authentication</Label>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Support</h3>
                <p className="text-sm text-gray-600">
                  If you need help or have questions, please contact your system administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Application Customization
              </CardTitle>
              <CardDescription>
                Customize company information, themes, and application behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Available Customizations</h3>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mt-2">
                    <li>Company information and branding</li>
                    <li>Invoice settings and templates</li>
                    <li>Theme colors and appearance</li>
                    <li>Notification preferences</li>
                    <li>Point of sale settings</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={handleCustomizationClick} className="w-full">
                    <Palette className="w-4 h-4 mr-2" />
                    Open Customization Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
