import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, Zap, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [canContinue, setCanContinue] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Assistance',
      description: 'Smart suggestions for your daily needs with intelligent matching'
    },
    {
      icon: Zap,
      title: 'Instant Connections',
      description: 'Connect with verified local service providers in seconds'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays yours. Complete control over your information'
    },
    {
      icon: CheckCircle,
      title: 'Simple & Efficient',
      description: 'Manage all your real-life tasks from one beautiful interface'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onComplete();
    }
  };

  const currentFeatureData = features[currentFeature];
  const Icon = currentFeatureData.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-black via-[#0a0e1a] to-black p-6">
      {/* Logo and Brand */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          OnePoint ALO
        </h1>
        <p className="text-muted-foreground text-center mb-12">
          Autonomous Life Operating System
        </p>

        {/* Feature Display */}
        <div className="glass-card rounded-3xl p-8 w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 flex items-center justify-center mb-6 mx-auto">
            <Icon className="w-8 h-8 text-[#7C3AED]" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
            {currentFeatureData.title}
          </h2>
          <p className="text-muted-foreground text-center leading-relaxed">
            {currentFeatureData.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2 mb-6">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentFeature 
                  ? 'w-8 bg-[#7C3AED]' 
                  : index < currentFeature 
                  ? 'w-2 bg-[#7C3AED]/50' 
                  : 'w-2 bg-muted/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Button
          onClick={handleNext}
          disabled={!canContinue}
          className="w-full h-14 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-lg"
        >
          {currentFeature < features.length - 1 ? 'Next' : 'Get Started'}
        </Button>
        
        {currentFeature > 0 && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
