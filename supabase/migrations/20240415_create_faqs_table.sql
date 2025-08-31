-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
  ON faqs FOR SELECT 
  USING (true);

-- Create policy for admin users to insert/update/delete
CREATE POLICY "Allow admin users full access" 
  ON faqs FOR ALL 
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Insert some default FAQs
INSERT INTO faqs (question, answer) VALUES
('What is YourFantasy AI?', 'YourFantasy AI is a platform that powers immersive experiences with AI companions. It allows users to create, customize, and interact with AI characters that can engage in conversation, generate images, and provide companionship.'),
('Is YourFantasy AI legit and safe?', 'Yes, YourFantasy AI is legitimate and prioritizes user safety and privacy. All conversations are protected with SSL encryption, and we offer optional two-factor authentication to keep your account secure. Your personal information and interactions remain private.'),
('What is an AI Companion, and can I make my own?', 'An AI companion is a digital partner who can talk, react, flirt, and connect with you in real time. You can create your own companion from scratch or choose from a wide range of existing characters designed for different moods and personalities.'),
('Can I ask for pictures, videos, and voice?', 'Yes, your companion can send selfies, generate custom videos, or respond with their voice. You can request specific outfits, unique poses, or playful scenarios that match your fantasy. Your character will reflect the face, tone, and mood you''re craving.'),
('How will YourFantasy AI appear on my bank statements?', 'We value your privacy. Any transactions appear under our discreet parent company, EverAI, so nothing on your bank statement will reveal your YourFantasy AI experience.');
