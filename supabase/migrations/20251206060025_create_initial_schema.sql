/*
  # Initial Database Schema for OnePoint ALO

  ## Overview
  Creates the complete database schema for the OnePoint Autonomous Life Operating System,
  including tables for users, needs, providers, jobs, and messaging.

  ## Tables Created
  
  ### 1. users
  Extended user profile information
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text, nullable) - Phone number
  - `avatar_url` (text, nullable) - Profile picture URL
  - `default_address` (text, nullable) - Default location
  - `wallet_balance` (integer) - Balance in cents
  - `kyc_status` (text) - KYC verification status
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. needs
  User needs/tasks to be fulfilled
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References users
  - `title` (text) - Need title
  - `description` (text) - Detailed description
  - `category` (text) - Category (Shopping, Home Repair, etc.)
  - `photos` (text[]) - Array of photo URLs
  - `location` (text, nullable) - Location for service
  - `suggested_plan` (jsonb, nullable) - AI-generated plan
  - `estimated_price_cents` (integer) - Estimated cost
  - `currency` (text) - Currency code
  - `status` (text) - Current status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. providers
  Service providers
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable) - References users if provider has account
  - `business_name` (text) - Business name
  - `categories` (text[]) - Services offered
  - `rating` (decimal) - Average rating
  - `verified_documents` (text[]) - Verification documents
  - `payout_account_id` (text, nullable) - Payment account
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. jobs
  Job assignments and tracking
  - `id` (uuid, primary key)
  - `need_id` (uuid) - References needs
  - `provider_id` (uuid) - References providers
  - `user_id` (uuid) - References users
  - `escrow_status` (text) - Payment escrow status
  - `amount_cents` (integer) - Job amount
  - `currency` (text) - Currency code
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)

  ### 5. conversations
  Chat conversations between users and providers
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References users
  - `provider_id` (uuid) - References providers
  - `need_id` (uuid) - References needs
  - `last_message` (text) - Last message content
  - `last_message_at` (timestamptz) - Last message time
  - `unread_count` (integer) - Unread message count
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. messages
  Individual chat messages
  - `id` (uuid, primary key)
  - `conversation_id` (uuid) - References conversations
  - `sender_id` (uuid) - References users/providers
  - `sender_type` (text) - 'user' or 'provider'
  - `content` (text) - Message content
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Providers can only access conversations they're part of
  - Public read access for provider listings

  ## Indexes
  - Created on foreign keys for performance
  - Created on status fields for filtering
  - Created on timestamps for sorting
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  default_address TEXT,
  wallet_balance INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Needs table
CREATE TABLE IF NOT EXISTS needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  location TEXT,
  suggested_plan JSONB,
  estimated_price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.0,
  verified_documents TEXT[] DEFAULT '{}',
  payout_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  escrow_status TEXT DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'provider')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_needs_user_id ON needs(user_id);
CREATE INDEX IF NOT EXISTS idx_needs_status ON needs(status);
CREATE INDEX IF NOT EXISTS idx_needs_created_at ON needs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_need_id ON jobs(need_id);
CREATE INDEX IF NOT EXISTS idx_jobs_provider_id ON jobs(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider_id ON conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for needs table
CREATE POLICY "Users can view own needs"
  ON needs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create needs"
  ON needs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own needs"
  ON needs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own needs"
  ON needs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for providers table
CREATE POLICY "Everyone can view providers"
  ON providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Provider owners can update"
  ON providers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for jobs table
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for conversations table
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Insert demo providers
INSERT INTO providers (business_name, categories, rating, verified_documents) VALUES
  ('Swift Plumbing Services', ARRAY['Plumbing', 'Emergency'], 4.9, ARRAY['license', 'insurance']),
  ('Elite Electricians', ARRAY['Electrical', 'Installation'], 4.8, ARRAY['license', 'insurance', 'background-check']),
  ('Green Thumb Landscaping', ARRAY['Landscaping', 'Maintenance'], 4.7, ARRAY['license']),
  ('Home Clean Pros', ARRAY['Cleaning', 'Deep Clean'], 4.9, ARRAY['insurance', 'background-check']),
  ('Tech Support Now', ARRAY['IT Support', 'Tech'], 4.6, ARRAY['license']),
  ('Perfect Paint Co', ARRAY['Painting', 'Interior'], 4.8, ARRAY['license', 'insurance']),
  ('HandyPro Services', ARRAY['Home Repair', 'Maintenance'], 4.7, ARRAY['license', 'insurance']),
  ('Quick Fix Automotive', ARRAY['Automotive', 'Repair'], 4.8, ARRAY['license', 'insurance']),
  ('Garden Masters', ARRAY['Landscaping', 'Garden'], 4.9, ARRAY['license']),
  ('Clean Sweep Co', ARRAY['Cleaning', 'Commercial'], 4.6, ARRAY['insurance', 'background-check'])
ON CONFLICT DO NOTHING;
