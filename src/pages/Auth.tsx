
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-vibrant">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center glass">
            <Sparkles className="w-8 h-8 text-white animate-float" />
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Marketing content */}
          <div className="text-white space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 glass">
              <Sparkles className="w-4 h-4 text-white animate-float" />
              <span className="text-sm font-medium">Secure Access</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome to the Future of
              <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of businesses streamlining their operations with our intelligent inventory system.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-cool rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-warm rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Real-time synchronization</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <Card className="glass border-white/20 backdrop-blur-md hover-lift animate-slide-in-right">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                Inventory Management
              </CardTitle>
              <CardDescription className="text-center text-white/80">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
                  <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-white">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-white">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                        placeholder="Enter your password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-primary hover:bg-white/90 hover-lift" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        required
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                        placeholder="Create a password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-primary hover:bg-white/90 hover-lift" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
