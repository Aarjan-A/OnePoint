import { useEffect, useState } from 'react';
import { Brain, Zap, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModernLogo from './ModernLogo';

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
    }, 1500);

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black p-6">
      {/* Logo and Brand */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        <div className="mb-8">
          <ModernLogo size={96} animated />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-2 text-center">
          OnePoint
        </h1>
        <p className="text-lg text-gray-400 text-center mb-12">
          Autonomous Life Operating System
        </p>

        {/* Feature Display */}
        <div className="glass-card rounded-3xl p-8 w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 mx-auto">
            <Icon className="w-8 h-8 text-primary" />
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
                  ? 'w-8 bg-primary' 
                  : index < currentFeature 
                  ? 'w-2 bg-primary/50' 
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
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg"
          data-testid="splash-next-btn"
        >
          {currentFeature < features.length - 1 ? 'Next' : 'Get Started'}
        </Button>
        
        {currentFeature > 0 && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/20"
            data-testid="splash-skip-btn"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
