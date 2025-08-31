-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  personality TEXT,
  occupation TEXT,
  hobbies TEXT,
  body TEXT,
  ethnicity TEXT,
  language TEXT,
  relationship TEXT,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  system_prompt TEXT NOT NULL,
  character_type TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS characters_created_at_idx ON characters (created_at DESC);
CREATE INDEX IF NOT EXISTS characters_character_type_idx ON characters (character_type);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
  ON characters FOR SELECT 
  USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" 
  ON characters FOR ALL 
  USING (auth.role() = 'authenticated');

-- Set up storage for character images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images
CREATE POLICY "Allow public access to images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS generated_images_user_id_idx ON generated_images (user_id);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON generated_images (created_at DESC);

-- Enable Row Level Security
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own images
DROP POLICY IF EXISTS "Users can view their own images" ON generated_images;
CREATE POLICY "Users can view their own images" 
ON generated_images FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own images
DROP POLICY IF EXISTS "Users can insert their own images" ON generated_images;
CREATE POLICY "Users can insert their own images" 
ON generated_images FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own images
DROP POLICY IF EXISTS "Users can delete their own images" ON generated_images;
CREATE POLICY "Users can delete their own images" 
ON generated_images FOR DELETE 
USING (auth.uid() = user_id);
