-- Add plan_id, plan_name, and plan_duration columns to premium_profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'premium_profiles' AND column_name = 'plan_id') THEN
        ALTER TABLE premium_profiles ADD COLUMN plan_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'premium_profiles' AND constraint_name = 'premium_profiles_plan_id_fkey') THEN
        ALTER TABLE premium_profiles ADD CONSTRAINT premium_profiles_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'premium_profiles' AND column_name = 'plan_name') THEN
        ALTER TABLE premium_profiles ADD COLUMN plan_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'premium_profiles' AND column_name = 'plan_duration') THEN
        ALTER TABLE premium_profiles ADD COLUMN plan_duration INTEGER DEFAULT 1;
    END IF;
END
$$;
