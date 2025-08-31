-- Add upload_error column to generated_images table
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS upload_error TEXT;
