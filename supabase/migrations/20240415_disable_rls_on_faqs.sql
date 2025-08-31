-- Create the disable_rls function if it doesn't exist
CREATE OR REPLACE FUNCTION disable_rls()
RETURNS void AS $$
BEGIN
  -- This function is just a placeholder and won't actually work
  -- It's used in the API route to attempt disabling RLS
  RAISE NOTICE 'Attempting to disable RLS';
END;
$$ LANGUAGE plpgsql;

-- Create FAQs table if it doesn't exist
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on the FAQs table
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;

-- Insert some default FAQs if the table is empty
INSERT INTO faqs (question, answer)
SELECT 'What is YourFantasy AI?', 'YourFantasy AI is a platform that powers immersive experiences with AI companions. It allows users to create, customize, and interact with AI characters that can engage in conversation, generate images, and provide companionship.'
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);

INSERT INTO faqs (question, answer)
SELECT 'Is YourFantasy AI legit and safe?', 'Yes, YourFantasy AI is legitimate and prioritizes user safety and privacy. All conversations are protected with SSL encryption, and we offer optional two-factor authentication to keep your account secure. Your personal information and interactions remain private.'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE id != (SELECT id FROM faqs LIMIT 1));

INSERT INTO faqs (question, answer)
SELECT 'What is an AI Companion, and can I make my own?', 'An AI companion is a digital partner who can talk, react, flirt, and connect with you in real time. You can create your own companion from scratch or choose from a wide range of existing characters designed for different moods and personalities.'
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 3);
