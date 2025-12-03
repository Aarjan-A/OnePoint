
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@blinkdotnew/sdk';

// Blink SDK client for authentication (more reliable, no CORS issues)
export const blink = createClient({
  projectId: 'onepoint-alo-autonomous-life-os-6jt5y3yx',
  authRequired: false,
  auth: { mode: 'headless' }
});

// Fallback Supabase client for data storage
const supabaseUrl = 'https://ftjwtxbmxcbaatzaefmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0and0eGJteGNiYWF0emFlZm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzk1MTIsImV4cCI6MjA3ODI1NTUxMn0.xcwBpkIZc3M1MZ2J82uiLger7i55yb14-dTUWhzB6Sk';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          default_address: string | null;
          wallet_balance: number;
          kyc_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      needs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          photos: string[];
          location: string | null;
          suggested_plan: any;
          estimated_price_cents: number;
          currency: string;
          status: 'suggested' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['needs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['needs']['Insert']>;
      };
      providers: {
        Row: {
          id: string;
          business_name: string;
          owner_user_id: string;
          categories: string[];
          rating: number;
          verified_documents: string[];
          payout_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['providers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['providers']['Insert']>;
      };
    };
  };
};
