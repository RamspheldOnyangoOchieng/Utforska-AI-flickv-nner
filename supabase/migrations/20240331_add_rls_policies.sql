-- Enable Row Level Security on the tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;

DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;

-- Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id);
