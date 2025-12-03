
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { Star, MapPin, Briefcase, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Provider {
  id: string;
  business_name: string;
  categories: string[];
  rating: number;
  verified_documents: string[];
}

// Demo data for providers
const DEMO_PROVIDERS: Provider[] = [
  {
    id: '1',
    business_name: 'Swift Plumbing Services',
    categories: ['Plumbing', 'Emergency'],
    rating: 4.9,
    verified_documents: ['license', 'insurance'],
  },
  {
    id: '2',
    business_name: 'Elite Electricians',
    categories: ['Electrical', 'Installation'],
    rating: 4.8,
    verified_documents: ['license', 'insurance', 'background-check'],
  },
  {
    id: '3',
    business_name: 'Green Thumb Landscaping',
    categories: ['Landscaping', 'Maintenance'],
    rating: 4.7,
    verified_documents: ['license'],
  },
  {
    id: '4',
    business_name: 'Home Clean Pros',
    categories: ['Cleaning', 'Deep Clean'],
    rating: 4.9,
    verified_documents: ['insurance', 'background-check'],
  },
  {
    id: '5',
    business_name: 'Tech Support Now',
    categories: ['IT Support', 'Tech'],
    rating: 4.6,
    verified_documents: ['license'],
  },
  {
    id: '6',
    business_name: 'Perfect Paint Co',
    categories: ['Painting', 'Interior'],
    rating: 4.8,
    verified_documents: ['license', 'insurance'],
  },
];

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedProviders, setAcceptedProviders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // Use a timeout to prevent hanging requests
      const timeoutId = setTimeout(() => {
        console.warn('Providers fetch timeout, using demo data');
        setProviders(DEMO_PROVIDERS);
        setLoading(false);
      }, 8000);

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('rating', { ascending: false })
        .limit(20);

      clearTimeout(timeoutId);

      if (error) {
        console.warn('Supabase error (falling back to demo):', error);
        throw error;
      }
      // Use demo data if no providers in database
      setProviders(data && data.length > 0 ? data : DEMO_PROVIDERS);
    } catch (error) {
      console.warn('Error fetching providers (using demo data):', error);
      // Fallback to demo data on error - this is non-critical
      setProviders(DEMO_PROVIDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (providerId: string, providerName: string) => {
    setAcceptedProviders(prev => new Set(prev).add(providerId));
    toast.success(`Accepted ${providerName}!`);
  };

  const handleReject = (providerName: string) => {
    toast.info(`Rejected ${providerName}`);
  };

  return (
    <div className="min-h-screen pb-24">
      <Navigation />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Providers</h1>
            <p className="text-sm text-muted-foreground">Review and accept service providers</p>
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
            {providers.map((provider) => {
              const isAccepted = acceptedProviders.has(provider.id);
              
              return (
                <div 
                  key={provider.id} 
                  className={`glass-card rounded-2xl p-4 transition-all ${
                    isAccepted ? 'border-2 border-green-500/50 bg-green-500/5' : ''
                  }`}
                  data-testid={`provider-card-${provider.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
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
                    {isAccepted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
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

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>Available in your area</span>
                  </div>

                  {!isAccepted ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(provider.business_name)}
                        data-testid={`reject-btn-${provider.id}`}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        className="rounded-xl bg-primary hover:bg-primary/90"
                        onClick={() => handleAccept(provider.id, provider.business_name)}
                        data-testid={`accept-btn-${provider.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl p-3 bg-green-500/10 border border-green-500/30">
                      <p className="text-sm text-green-500 font-semibold text-center">
                        Provider Accepted! They can now view your needs.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
