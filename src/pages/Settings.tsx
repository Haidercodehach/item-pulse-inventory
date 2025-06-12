
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Info, Bell, Palette, Building, Sparkles } from 'lucide-react';
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
            <User className="w-8 h-8 animate-float" />
            Settings
          </h1>
          <p className="text-white/80">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <TabsTrigger value="profile" className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <Info className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-primary">
              <Palette className="w-4 h-4" />
              Customization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-white/80">
                  View and manage your profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-white/10 border-white/20 text-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full-name" className="text-white">Full Name</Label>
                    <Input
                      id="full-name"
                      value={profile?.full_name || ''}
                      disabled
                      className="bg-white/10 border-white/20 text-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-white">Role</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {profile?.role || 'employee'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="member-since" className="text-white">Member Since</Label>
                    <Input
                      id="member-since"
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                      disabled
                      className="bg-white/10 border-white/20 text-white/60 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-white/80">
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Account Security</h3>
                    <p className="text-sm text-white/70">
                      Your account is secured with email authentication through Supabase.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/20">
                    <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-white/70 mb-4">
                      Sign out of your account. You'll need to sign in again to access the application.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="hover-lift"
                    >
                      {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-white">System Information</CardTitle>
                <CardDescription className="text-white/80">
                  Application and system details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Application Version</Label>
                    <p className="text-sm text-white/70">v1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-white">Last Updated</Label>
                    <p className="text-sm text-white/70">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-white">Database Status</Label>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div>
                    <Label className="text-white">Authentication</Label>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <h3 className="text-lg font-medium mb-2 text-white">Support</h3>
                  <p className="text-sm text-white/70">
                    If you need help or have questions, please contact your system administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customization">
            <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Building className="w-5 h-5" />
                  Application Customization
                </CardTitle>
                <CardDescription className="text-white/80">
                  Customize company information, themes, and application behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Available Customizations</h3>
                    <ul className="text-sm text-white/70 list-disc list-inside space-y-1 mt-2">
                      <li>Company information and branding</li>
                      <li>Invoice settings and templates</li>
                      <li>Theme colors and appearance</li>
                      <li>Notification preferences</li>
                      <li>Point of sale settings</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-white/20">
                    <Button onClick={handleCustomizationClick} className="w-full bg-white text-primary hover:bg-white/90 hover-lift">
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
    </div>
  );
};

export default Settings;
