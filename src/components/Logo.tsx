
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'md', showText = false }: { size?: 'sm' | 'md' | 'lg', showText?: boolean }) {
  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-xs', icon: 'w-4 h-4', brandText: 'text-lg' },
    md: { container: 'w-12 h-12', text: 'text-sm', icon: 'w-5 h-5', brandText: 'text-xl' },
    lg: { container: 'w-16 h-16', text: 'text-lg', icon: 'w-6 h-6', brandText: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`${s.container} rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center relative overflow-hidden shadow-lg shadow-primary/30`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
        <Sparkles className={`${s.icon} text-white drop-shadow-lg relative z-10`} />
      </div>
      {showText && (
        <span className={`${s.brandText} font-black text-foreground glow-text`}>
          OnePoint
        </span>
      )}
    </div>
  );
}
