-- Add video_url column to characters table
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Comment on the column for documentation
COMMENT ON COLUMN characters.video_url IS 'URL to the character video that plays on hover';
