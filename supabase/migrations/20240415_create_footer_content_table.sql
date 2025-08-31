-- Create footer_content table
CREATE TABLE IF NOT EXISTS footer_content (
  id INTEGER PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for simplicity
ALTER TABLE footer_content DISABLE ROW LEVEL SECURITY;

-- Insert default content
INSERT INTO footer_content (id, content) VALUES (
  1, 
  '{
    "companyName": "AI Character Explorer",
    "companyDescription": "AI Character Explorer powers immersive experiences that feel real, allowing users to generate images and create AI characters.",
    "contactAddress": "AI Character Explorer Inc.\n123 AI Boulevard, Suite 456\nSan Francisco, CA 94105",
    "features": [
      {"id": 1, "title": "Generate Image", "url": "/generate"},
      {"id": 2, "title": "Chat", "url": "/chat"},
      {"id": 3, "title": "Create Character", "url": "/characters"},
      {"id": 4, "title": "Gallery", "url": "/collection"},
      {"id": 5, "title": "My AI", "url": "/profile"}
    ],
    "popular": [
      {"id": 1, "title": "AI Character Explorer", "url": "/"},
      {"id": 2, "title": "AI Girlfriend", "url": "/characters?category=companion"},
      {"id": 3, "title": "AI Anime", "url": "/characters?category=anime"},
      {"id": 4, "title": "AI Boyfriend", "url": "/characters?category=companion"}
    ],
    "legal": [
      {"id": 1, "title": "Terms and Policies", "url": "/terms"}
    ],
    "company": [
      {"id": 1, "title": "We\'re hiring", "url": "/careers"}
    ]
  }'
) ON CONFLICT (id) DO NOTHING;
