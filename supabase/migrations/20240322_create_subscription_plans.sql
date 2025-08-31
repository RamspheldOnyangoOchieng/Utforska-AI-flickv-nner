-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  original_price NUMERIC NOT NULL,
  discounted_price NUMERIC,
  discount_percentage INTEGER,
  is_popular BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  promotional_image TEXT,
  features_image TEXT
);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage subscription plans
CREATE POLICY "Admins can manage subscription plans" 
ON subscription_plans
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'app_metadata' ? 'is_admin' AND auth.jwt() ->> 'app_metadata' ->> 'is_admin' = 'true');

-- Allow all users to view subscription plans
CREATE POLICY "All users can view subscription plans" 
ON subscription_plans
FOR SELECT
TO authenticated
USING (true);
