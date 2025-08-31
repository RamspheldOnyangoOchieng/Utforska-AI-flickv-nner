-- Create the transactions table to store payment information
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_session_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    stripe_payment_intent_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER on_transactions_updated
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session_id ON public.transactions(stripe_session_id);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- 1. Allow users to view their own transactions
CREATE POLICY "Allow users to view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow full access for the service_role (for webhooks and admin operations)
CREATE POLICY "Allow service_role to perform all actions"
ON public.transactions FOR ALL
USING (auth.role() = 'service_role');

COMMENT ON TABLE public.transactions IS 'Stores payment transaction details from Stripe.';
COMMENT ON COLUMN public.transactions.user_id IS 'Links the transaction to a user in the auth.users table.';
COMMENT ON COLUMN public.transactions.stripe_session_id IS 'The unique session ID from a Stripe Checkout session.';
COMMENT ON COLUMN public.transactions.status IS 'The status of the payment (e.g., pending, paid, failed).';
COMMENT ON COLUMN public.transactions.metadata IS 'Stores additional metadata from the Stripe session.';