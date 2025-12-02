import ModernLogo from './ModernLogo';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="mb-8 animate-pulse">
        <ModernLogo size={80} />
      </div>
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
