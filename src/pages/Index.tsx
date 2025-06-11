
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, BarChart3, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track and manage your inventory items with detailed information including SKU, quantity, pricing, and categories."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights into your inventory with comprehensive charts, low stock alerts, and exportable reports."
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure access control with different permission levels for admins, managers, and employees."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live inventory tracking with real-time updates across all devices and users."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Modern Inventory</span>
            <span className="block text-blue-600">Management System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your inventory operations with our comprehensive management platform. 
            Track items, monitor stock levels, and generate insights in real-time.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to get started?</h2>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            Sign In to Your Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
