-- Create user_tokens table to track token balances
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_tokens_user_id_key UNIQUE (user_id)
);

-- Create token_transactions table to track token usage and purchases
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  payment_id TEXT,
  image_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx ON user_tokens (user_id);
CREATE INDEX IF NOT EXISTS token_transactions_user_id_idx ON token_transactions (user_id);
CREATE INDEX IF NOT EXISTS token_transactions_created_at_idx ON token_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS token_transactions_type_idx ON token_transactions (type);

-- Enable Row Level Security
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own token balance
CREATE POLICY "Users can view their own token balance" 
  ON user_tokens FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to view their own token transactions
CREATE POLICY "Users can view their own token transactions" 
  ON token_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for server-side functions to manage token balances
CREATE POLICY "Server can manage token balances" 
  ON user_tokens FOR ALL 
  USING (true);

-- Create policy for server-side functions to manage token transactions
CREATE POLICY "Server can manage token transactions" 
  ON token_transactions FOR ALL 
  USING (true);

-- Create policy for admins to view all token data
CREATE POLICY "Admins can view all token balances" 
  ON user_tokens FOR SELECT 
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.users.email IN (
      SELECT email FROM admin_users
    )
  ));

CREATE POLICY "Admins can view all token transactions" 
  ON token_transactions FOR SELECT 
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.users.email IN (
      SELECT email FROM admin_users
    )
  ));
