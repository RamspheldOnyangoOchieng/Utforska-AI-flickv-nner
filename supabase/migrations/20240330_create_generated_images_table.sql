-- Create table for storing generated images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);

-- Add RLS policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own images
CREATE POLICY "Users can view their own images" 
  ON generated_images 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own images
CREATE POLICY "Users can insert their own images" 
  ON generated_images 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own images
CREATE POLICY "Users can update their own images" 
  ON generated_images 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own images
CREATE POLICY "Users can delete their own images" 
  ON generated_images 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow anonymous access for demo purposes (optional)
CREATE POLICY "Anonymous users can view public images" 
  ON generated_images 
  FOR SELECT 
  USING (user_id = '00000000-0000-0000-0000-000000000000');
