import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, BarChart3, Shield, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
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

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Track and manage your inventory items with detailed information including SKU, quantity, pricing, and categories.",
      delay: "0ms",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Get insights into your inventory with comprehensive charts, low stock alerts, and exportable reports.",
      delay: "200ms",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description:
        "Secure access control with different permission levels for admins, managers, and employees.",
      delay: "400ms",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "Live inventory tracking with real-time updates across all devices and users.",
      delay: "600ms",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 glass">
            <Sparkles className="w-5 h-5 text-white animate-bounce-slow" />
            <span className="text-white font-medium">
              Next Generation Inventory
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            <span className="block animate-fade-in">Modern Inventory</span>
            <span className="block mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent animate-slide-in-right">
              Management System
            </span>
          </h1>

          <p className="mt-6 max-w-md mx-auto text-lg text-white/90 sm:text-xl md:mt-8 md:text-xl md:max-w-3xl animate-fade-in">
            Streamline your inventory operations with our comprehensive
            management platform. Track items, monitor stock levels, and generate
            insights in real-time.
          </p>

          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 hover-lift hover-glow text-lg px-8 py-4 animate-scale-in"
            >
              Get Started
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="text-center glass border-white/20 hover-lift animate-slide-up backdrop-blur-md"
                style={{ animationDelay: feature.delay }}
              >
                <CardHeader>
                  <div className="mx-auto h-16 w-16 rounded-full bg-gradient-cool flex items-center justify-center hover-glow animate-float">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white mt-4">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center animate-slide-up">
          <div className="glass rounded-3xl p-12 border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of businesses managing their inventory smarter
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-white/30 text-primary hover:bg-white hover:text-primary hover-lift text-lg px-8 py-4"
            >
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
