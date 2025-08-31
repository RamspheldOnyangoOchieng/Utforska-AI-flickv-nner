-- Add policies for anonymous access
CREATE POLICY "Anonymous users can access their own images"
ON generated_images FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anonymous users can access their own collections"
ON collections FOR ALL
USING (auth.uid() IS NOT NULL);
