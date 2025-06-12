
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 glass">
            <AlertTriangle className="w-5 h-5 text-white animate-float" />
            <span className="text-white font-medium">Page Not Found</span>
          </div>
          
          <h1 className="text-8xl font-bold text-white animate-scale-in">404</h1>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white animate-slide-up">
              Oops! Page not found
            </h2>
            <p className="text-lg text-white/80 animate-slide-up" style={{ animationDelay: '200ms' }}>
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-semibold text-white mb-4">What would you like to do?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/')}
              className="bg-white text-primary hover:bg-white/90 hover-lift"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white hover:text-primary hover-lift"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
