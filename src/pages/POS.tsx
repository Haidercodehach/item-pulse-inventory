
import POSSystem from '@/components/POSSystem';
import { Sparkles } from 'lucide-react';

const POS = () => {
  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 p-6 animate-fade-in">
        <div className="bg-gradient-cool rounded-2xl p-8 text-white mb-6 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 animate-float" />
            Point of Sale
          </h1>
          <p className="text-white/80">Complete sales transactions and manage customer orders</p>
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <POSSystem />
        </div>
      </div>
    </div>
  );
};

export default POS;
