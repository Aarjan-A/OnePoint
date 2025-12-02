import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const searchItems = [
    { title: 'My Needs', path: '/needs', keywords: ['needs', 'tasks', 'requests'] },
    { title: 'Providers', path: '/providers', keywords: ['providers', 'services', 'professionals'] },
    { title: 'AI Chat', path: '/chat', keywords: ['chat', 'ai', 'assistant', 'help'] },
    { title: 'Settings', path: '/settings', keywords: ['settings', 'profile', 'account', 'preferences'] },
    { title: 'Dashboard', path: '/', keywords: ['dashboard', 'home', 'overview'] },
  ];

  const filteredItems = query
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.some((keyword) => keyword.toLowerCase().includes(query.toLowerCase()))
      )
    : searchItems;

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
    toast.success('Navigated successfully');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="glass-card-hover rounded-2xl p-4 flex items-center gap-3 w-full"
        data-testid="quick-search-btn"
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm text-muted-foreground">Quick Search...</p>
        </div>
      </button>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, pages..."
            className="pl-10 bg-background/50 border-border/50 h-11 rounded-xl"
            autoFocus
            data-testid="search-input"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(false);
            setQuery('');
          }}
          className="rounded-xl"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item.path)}
              className="w-full text-left glass-card-hover rounded-xl p-3 transition-colors"
              data-testid={`search-result-${index}`}
            >
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.path}</p>
            </button>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}
