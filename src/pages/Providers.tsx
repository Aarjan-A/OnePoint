
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { Star, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Provider {
  id: string;
  business_name: string;
  categories: string[];
  rating: number;
  verified_documents: string[];
}

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('rating', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Providers</h1>
            <p className="text-sm text-muted-foreground">Find trusted service providers near you</p>
          </div>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No providers available yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for service providers in your area</p>
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="glass-card-hover rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">
                        {provider.business_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{provider.business_name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                        {provider.verified_documents.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold text-primary">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {provider.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-muted/50 text-muted-foreground"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Available in your area</span>
                </div>

                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}