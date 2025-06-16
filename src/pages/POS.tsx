
import POSSystem from '@/components/POSSystem';
import { Sparkles, ShoppingCart } from 'lucide-react';

const POS = () => {
  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/8 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-4 md:p-6 animate-fade-in">
        <div className="bg-gradient-cool rounded-2xl p-6 md:p-8 text-white mb-6 animate-slide-up shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <ShoppingCart className="w-8 h-8 animate-float" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Point of Sale</h1>
                <p className="text-white/80 text-sm md:text-base">Complete sales transactions and manage customer orders</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Live System</span>
            </div>
          </div>
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <POSSystem />
        </div>
      </div>
    </div>
  );
};

export default POS;
