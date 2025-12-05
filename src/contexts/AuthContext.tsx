
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { blink, supabase } from '@/lib/supabase';
import { initializeStorageBuckets } from '@/lib/initStorage';

interface User {
  id: string;
  email?: string;
  displayName?: string;
  metadata?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.fullName,
          metadata: session.user.user_metadata
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.fullName,
          metadata: session.user.user_metadata
        });
        
        // Initialize storage buckets when user logs in (non-blocking)
        initializeStorageBuckets().catch((error) => {
          console.warn('Storage initialization failed (non-critical):', error);
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Try Supabase first as it's configured
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
      }
      
      // Update user state
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.fullName,
          metadata: data.user.user_metadata
        });
      }
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Use Supabase for signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            fullName: fullName
          },
        },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create account. Please try again.');
      }
      
      // Insert user profile
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          wallet_balance: 0,
          kyc_status: 'pending',
        }).catch((insertError) => {
          console.warn('Could not insert user profile:', insertError);
        });
        
        // Update user state
        setUser({
          id: data.user.id,
          email: data.user.email,
          displayName: fullName,
          metadata: { fullName }
        });
      }
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
