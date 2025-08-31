-- Update the RLS policy for subscription_plans table to allow admins to insert new rows
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;

-- Create a new policy that allows admins to manage subscription plans
CREATE POLICY "Admins can manage subscription plans" 
ON subscription_plans
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb ? 'is_admin' 
  AND 
  ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin')::boolean = true
);

-- Allow all users to view subscription plans
DROP POLICY IF EXISTS "All users can view subscription plans" ON subscription_plans;

CREATE POLICY "All users can view subscription plans" 
ON subscription_plans
FOR SELECT
TO authenticated
USING (true);

-- Also allow anonymous users to view subscription plans
CREATE POLICY "Anonymous users can view subscription plans" 
ON subscription_plans
FOR SELECT
TO anon
USING (true);
