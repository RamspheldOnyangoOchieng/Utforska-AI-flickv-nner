-- Step 1: Create generated_images table
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
USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 10: Create a page to display this SQL
