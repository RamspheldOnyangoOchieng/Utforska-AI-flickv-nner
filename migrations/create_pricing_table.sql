-- Function to create the pricing table
CREATE OR REPLACE FUNCTION create_pricing_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'pricing'
  ) THEN
    -- Create the pricing table
    CREATE TABLE public.pricing (
      id TEXT PRIMARY KEY,
      monthly_price DECIMAL(10,2) NOT NULL DEFAULT 9.99,
      yearly_price DECIMAL(10,2) NOT NULL DEFAULT 99.99,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Insert default pricing
    INSERT INTO public.pricing (id, monthly_price, yearly_price, currency, created_at, updated_at)
    VALUES ('1', 9.99, 99.99, 'USD', NOW(), NOW());
    
    -- Set up Row Level Security
    ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for admins to manage pricing
    CREATE POLICY admin_manage_pricing ON public.pricing
      USING (EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
      ));
      
    -- Grant permissions to authenticated users (RLS will restrict access)
    GRANT ALL ON public.pricing TO authenticated;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_pricing_table() TO authenticated;
