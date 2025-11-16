import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [glowPosition, setGlowPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPosition((prev) => (prev + 1) % 100);
    }, 30);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0e1a] to-black" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/10 blur-3xl animate-pulse"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Logo and text container */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo with pulsing glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-3xl" />
            <Sparkles className="w-16 h-16 text-white drop-shadow-2xl" />
          </div>
        </div>

        {/* Brand name with animated glow */}
        <div className="relative overflow-hidden">
          <h1 className="text-6xl font-black tracking-tight relative z-10">
            <span className="inline-block relative">
              <span className="glow-text-white text-white">OnePoint</span>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                style={{
                  transform: `translateX(${glowPosition - 50}%)`,
                  transition: 'transform 0.03s linear',
                }}
              />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground font-medium tracking-wide">
          Autonomous Life Operating System
        </p>

        {/* Loading indicator */}
        <div className="w-48 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-pulse"
            style={{
              width: `${(glowPosition % 100)}%`,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}
