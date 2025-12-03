
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
    // Use Blink SDK for auth state management
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
      
      // Initialize storage buckets when user logs in (non-blocking)
      if (state.user) {
        // Fire and forget - don't wait for storage initialization
        initializeStorageBuckets().catch((error) => {
          console.warn('Storage initialization failed (non-critical):', error);
        });
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Primary auth via Blink SDK
      const result = await blink.auth.signInWithEmail(email, password);
      
      if (!result || result.error) {
        throw new Error(result?.error?.message || 'Failed to sign in. Please check your credentials.');
      }
      
      // Optional Supabase sync (fire-and-forget, doesn't block)
      setTimeout(() => {
        supabase.auth.signInWithPassword({ email, password }).catch((supabaseError) => {
          console.warn('Supabase sync failed (non-critical):', supabaseError);
        });
      }, 0);
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Primary auth via Blink SDK
      const result = await blink.auth.signUp({
        email,
        password,
        displayName: fullName,
        metadata: { fullName }
      });
      
      if (!result || result.error) {
        throw new Error(result?.error?.message || 'Failed to create account. Please try again.');
      }
      
      // Optional Supabase sync (fire-and-forget, doesn't block)
      setTimeout(() => {
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        }).then(({ data }) => {
          if (data.user) {
            supabase.from('users').insert({
              id: data.user.id,
              email,
              full_name: fullName,
              wallet_balance: 0,
              kyc_status: 'pending',
            }).catch((insertError) => {
              console.warn('Could not insert user in Supabase (non-critical):', insertError);
            });
          }
        }).catch((supabaseError) => {
          console.warn('Supabase sync failed (non-critical):', supabaseError);
        });
      }, 0);
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      await blink.auth.logout();
      
      // Also sign out from Supabase
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.warn('Supabase signout failed (non-critical):', supabaseError);
      }
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
