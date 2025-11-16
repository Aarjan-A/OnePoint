
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import CreateNeedModal from '@/components/CreateNeedModal';
import { Plus, Clock, CheckCircle, XCircle, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Need {
  id: string;
  title: string;
  description: string;
  category: string;
  photos: string[];
  location: string | null;
  estimated_price_cents: number;
  status: string;
  created_at: string;
}

export default function Needs() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [createNeedOpen, setCreateNeedOpen] = useState(false);

  const fetchNeeds = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('needs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNeeds(data || []);
    } catch (error) {
      console.error('Error fetching needs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-accent" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'failed':
      case 'refunded':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'in_progress':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Navigation />
      
      <CreateNeedModal 
        open={createNeedOpen} 
        onOpenChange={setCreateNeedOpen}
        onSuccess={fetchNeeds}
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Needs</h1>
          <Button 
            className="rounded-xl bg-primary hover:bg-primary/90"
            onClick={() => setCreateNeedOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Need
          </Button>
        </div>
        
        {loading ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading your needs...</p>
          </div>
        ) : needs.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any needs yet</p>
            <Button 
              className="rounded-xl bg-primary hover:bg-primary/90"
              onClick={() => setCreateNeedOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Need
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {needs.map((need) => (
              <div key={need.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{need.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{need.description}</p>
                  </div>
                  <div className="ml-3">
                    {getStatusIcon(need.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(need.status)}`}>
                    {need.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-muted/50 text-muted-foreground">
                    {need.category}
                  </span>
                </div>

                {need.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{need.location}</span>
                  </div>
                )}

                {need.photos.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {need.photos.slice(0, 3).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Need photo ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ))}
                    {need.photos.length > 3 && (
                      <div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                        +{need.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(need.created_at).toLocaleDateString()}
                  </span>
                  {need.estimated_price_cents > 0 && (
                    <span className="text-sm font-semibold text-foreground">
                      ${(need.estimated_price_cents / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
