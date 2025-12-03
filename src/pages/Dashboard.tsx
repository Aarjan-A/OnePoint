
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import CreateNeedModal from '@/components/CreateNeedModal';
import VoiceAssistant from '@/components/VoiceAssistant';
import QuickSearch from '@/components/QuickSearch';
import RecentActivity from '@/components/RecentActivity';
import BudgetTracker from '@/components/BudgetTracker';
import WeatherWidget from '@/components/WeatherWidget';
import { Plus, Search, Mic, AlertCircle, CheckCircle, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [createNeedOpen, setCreateNeedOpen] = useState(false);
  const [stats, setStats] = useState({
    activeNeeds: 0,
    nearbyProviders: 45,
    pendingTasks: 0,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('GOOD MORNING');
    else if (hour < 18) setGreeting('GOOD AFTERNOON');
    else setGreeting('GOOD EVENING');

    // Fetch user profile and stats
    if (user) {
      setUserName(user.displayName || user.metadata?.fullName || 'User');

      // Fetch needs count
      supabase
        .from('needs')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .in('status', ['suggested', 'confirmed', 'assigned', 'in_progress'])
        .then(({ count }) => {
          setStats(prev => ({ ...prev, activeNeeds: count || 0 }));
        });

      // Fetch jobs count
      supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .in('escrow_status', ['pending', 'held'])
        .then(({ count }) => {
          setStats(prev => ({ ...prev, pendingTasks: count || 0 }));
        });
    }
  }, [user]);

  const quickActions = [
    { icon: Plus, label: 'Create Need', color: 'primary', onClick: () => setCreateNeedOpen(true) },
    { icon: Search, label: 'Find Providers', color: 'accent', onClick: () => navigate('/providers') },
    { icon: Mic, label: 'Voice Assistant', color: 'accent', onClick: () => navigate('/chat') },
    { icon: AlertCircle, label: 'Emergency Mode', color: 'destructive', onClick: () => toast.info('Emergency mode coming soon!') },
  ];

  const aiSuggestions = [
    {
      priority: 'EASY',
      title: 'Weekly Grocery',
      description: 'Plan your groceries for the week',
      category: 'Shopping',
      reason: 'You have completed this 7 times in the last 2 weeks',
    },
    {
      priority: 'MEDIUM',
      title: 'Car Maintenance Check',
      description: 'Schedule a check-up for your car',
      category: 'Automotive',
      reason: 'Based on your mileage, a check-up is due',
    },
    {
      priority: 'HARD',
      title: 'Renew Subscription',
      description: 'Your annual subscription expires soon.',
      category: 'Utilities',
      reason: 'Urgent! Renewal needed to avoid service interruption',
    },
  ];

  return (
    <div className="min-h-screen pb-24" data-testid="dashboard">
      <Navigation />
      <VoiceAssistant />
      
      <CreateNeedModal 
        open={createNeedOpen} 
        onOpenChange={setCreateNeedOpen}
        onSuccess={() => {
          // Refresh stats
          if (user) {
            supabase
              .from('needs')
              .select('id', { count: 'exact' })
              .eq('user_id', user.id)
              .in('status', ['suggested', 'confirmed', 'assigned', 'in_progress'])
              .then(({ count }) => {
                setStats(prev => ({ ...prev, activeNeeds: count || 0 }));
              });
          }
        }}
      />
      
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-2 border-primary/30">
              <span className="text-2xl font-bold text-white">
                {userName.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
              <p className="text-muted-foreground">{userName || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="mb-6">
          <WeatherWidget />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card-hover rounded-2xl p-4 text-center" data-testid="active-needs-card">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.activeNeeds}</div>
            <div className="text-xs text-muted-foreground">Active Needs</div>
          </div>
          
          <div className="glass-card-hover rounded-2xl p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.nearbyProviders}</div>
            <div className="text-xs text-muted-foreground">Nearby Providers</div>
          </div>
          
          <div className="glass-card-hover rounded-2xl p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.pendingTasks}</div>
            <div className="text-xs text-muted-foreground">Pending Tasks</div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="mb-6">
          <QuickSearch />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="glass-card-hover rounded-2xl p-4 min-w-[140px] flex flex-col items-center gap-2"
                data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className={`w-12 h-12 rounded-full ${
                  action.color === 'primary' ? 'bg-primary/20' : 
                  action.color === 'accent' ? 'bg-accent/20' : 
                  'bg-destructive/20'
                } flex items-center justify-center`}>
                  <action.icon className={`w-6 h-6 ${
                    action.color === 'primary' ? 'text-primary' : 
                    action.color === 'accent' ? 'text-accent' : 
                    'text-destructive'
                  }`} />
                </div>
                <span className="text-sm font-medium text-foreground text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <RecentActivity />
        </div>

        {/* Budget Tracker */}
        <div className="mb-6">
          <BudgetTracker />
        </div>

        {/* AI Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI SUGGESTIONS</h2>
          </div>
          
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="glass-card rounded-2xl p-4" data-testid={`ai-suggestion-${index}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded-lg bg-primary/20 border border-primary/30">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-lg ${
                      suggestion.priority === 'HARD' ? 'bg-destructive/20 border-destructive/30' : 
                      suggestion.priority === 'MEDIUM' ? 'bg-accent/20 border-accent/30' : 
                      'bg-green-500/20 border-green-500/30'
                    }`}>
                      <span className={`text-xs font-bold ${
                        suggestion.priority === 'HARD' ? 'text-destructive' : 
                        suggestion.priority === 'MEDIUM' ? 'text-accent' : 
                        'text-green-500'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-base font-semibold text-foreground mb-1">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Category: {suggestion.category}</span>
                  <Button 
                    size="sm" 
                    className="rounded-xl bg-primary hover:bg-primary/90 h-8"
                    onClick={() => setCreateNeedOpen(true)}
                    data-testid={`create-need-btn-${index}`}
                  >
                    Create Need
                  </Button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
