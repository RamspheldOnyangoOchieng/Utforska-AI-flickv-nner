"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle, Copy, Database } from "lucide-react"

export default function DatabaseSetupPage() {
  const [copied, setCopied] = useState(false)

  const completeSetupSQL = `-- Step 1: Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  steps INTEGER,
  seed BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add collection_id and other fields to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_collection_id ON generated_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_favorite ON generated_images(favorite);

-- Step 5: Remove foreign key constraint if it's causing issues
ALTER TABLE generated_images DROP CONSTRAINT IF EXISTS generated_images_collection_id_fkey;
ALTER TABLE generated_images ADD CONSTRAINT generated_images_collection_id_fkey 
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;

-- Step 6: Enable Row Level Security on the tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;
DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;

DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;
DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;

-- Step 8: Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 9: Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);`;

  const paymentsSetupSQL = `-- Create the transactions table to store payment information
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
CREATE POLICY "Allow users to view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow service_role to perform all actions" ON public.transactions FOR ALL USING (auth.role() = 'service_role');`;

  const userProfilesAndTokensSQL = `-- Create profiles table to store user-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  token_balance INT NOT NULL DEFAULT 100, -- Start users with 100 tokens
  is_premium BOOLEAN NOT NULL DEFAULT FALSE, -- Add is_premium column
  updated_at TIMESTAMP WITH TIME ZONE
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, is_premium)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    FALSE -- Default to false for new users
  );
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create premium_users table
CREATE TABLE IF NOT EXISTS public.premium_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- RLS for premium_users
ALTER TABLE public.premium_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own premium status." ON public.premium_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage premium status." ON public.premium_users FOR ALL USING (auth.role() = 'service_role');

-- Function to update profiles.is_premium when premium_users changes
CREATE OR REPLACE FUNCTION public.update_profile_premium_status()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET is_premium = TRUE
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET is_premium = FALSE
    WHERE id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on premium_users table
CREATE TRIGGER on_premium_users_change
AFTER INSERT OR UPDATE OR DELETE ON public.premium_users
FOR EACH ROW EXECUTE FUNCTION public.update_profile_premium_status();


`;


  const tablesOnlySQL = `-- Step 1: Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  steps INTEGER,
  seed BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add collection_id and other fields to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_collection_id ON generated_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_favorite ON generated_images(favorite);

-- Step 5: Remove foreign key constraint if it's causing issues
ALTER TABLE generated_images DROP CONSTRAINT IF EXISTS generated_images_collection_id_fkey;
ALTER TABLE generated_images ADD CONSTRAINT generated_images_collection_id_fkey 
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;`

  const rlsOnlySQL = `-- Step 1: Enable Row Level Security on the tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;
DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;

DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;
DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;

-- Step 3: Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 4: Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Database className="h-8 w-8" />
        Database Setup
      </h1>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Run these SQL scripts in your Supabase SQL Editor to set up the necessary tables and RLS policies. You can
          find the SQL Editor in your Supabase dashboard under SQL Editor.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="complete">
        <TabsList className="mb-4">
          <TabsTrigger value="complete">Complete Setup</TabsTrigger>
          <TabsTrigger value="tables">Tables Only</TabsTrigger>
          <TabsTrigger value="rls">RLS Policies Only</TabsTrigger>
          <TabsTrigger value="payments">Payments Setup</TabsTrigger>
          <TabsTrigger value="profiles">User Profiles & Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="complete">
          <Card>
            <CardHeader>
              <CardTitle>Complete Database Setup</CardTitle>
              <CardDescription>
                This script creates all necessary tables and sets up Row Level Security policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={completeSetupSQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(completeSetupSQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Tables Setup Only</CardTitle>
              <CardDescription>
                This script only creates the necessary tables without setting up RLS policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={tablesOnlySQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(tablesOnlySQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle>RLS Policies Only</CardTitle>
              <CardDescription>
                This script only sets up Row Level Security policies for existing tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={rlsOnlySQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(rlsOnlySQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments Setup</CardTitle>
              <CardDescription>
                This script creates the 'transactions' table and related policies for handling payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={paymentsSetupSQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(paymentsSetupSQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles & Tokens Setup</CardTitle>
              <CardDescription>
                This script creates the 'profiles' table and functions for managing user tokens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={userProfilesAndTokensSQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(userProfilesAndTokensSQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Go to your Supabase dashboard</li>
          <li>Click on "SQL Editor" in the left sidebar</li>
          <li>Create a "New Query"</li>
          <li>Paste the SQL script from above</li>
          <li>Click "Run" to execute the script</li>
          <li>Check for any errors in the output</li>
        </ol>
      </div>
    </div>
  )
}
