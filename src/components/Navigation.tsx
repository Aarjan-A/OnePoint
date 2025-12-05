
import { Link, useLocation } from 'react-router-dom';
import { Home, CheckCircle, MapPin, MessageCircle, Settings } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/needs', icon: CheckCircle, label: 'Needs' },
    { path: '/providers', icon: MapPin, label: 'Providers' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="glass-card border-t border-border/50 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
