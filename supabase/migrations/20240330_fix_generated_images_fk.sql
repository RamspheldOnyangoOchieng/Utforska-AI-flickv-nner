-- Option 1: Remove the foreign key constraint entirely
ALTER TABLE generated_images DROP CONSTRAINT IF EXISTS generated_images_user_id_fkey;

-- Option 2: Make the user_id column nullable and modify the constraint
-- ALTER TABLE generated_images ALTER COLUMN user_id DROP NOT NULL;
-- ALTER TABLE generated_images DROP CONSTRAINT IF EXISTS generated_images_user_id_fkey;
-- ALTER TABLE generated_images ADD CONSTRAINT generated_images_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
