-- Create stripe_keys table
CREATE TABLE IF NOT EXISTS stripe_keys (
  id SERIAL PRIMARY KEY,
  test_publishable_key TEXT,
  test_secret_key TEXT,
  live_publishable_key TEXT,
  live_secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_keys_id ON stripe_keys(id);
