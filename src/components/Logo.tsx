
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-sm', icon: 'w-3 h-3' },
    md: { container: 'w-12 h-12', text: 'text-xl', icon: 'w-4 h-4' },
    lg: { container: 'w-20 h-20', text: 'text-3xl', icon: 'w-6 h-6' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`${s.container} rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center relative overflow-hidden shadow-lg shadow-primary/20`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
        <span className={`${s.text} font-black text-white relative z-10`}>ALO</span>
        <Sparkles className={`${s.icon} text-white/80 absolute top-1 right-1`} />
      </div>
    </div>
  );
}