-- Character Profiles Table
CREATE TABLE IF NOT EXISTS character_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prompt_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS character_profiles_user_id_idx ON character_profiles(user_id);

-- Saved Prompts Table
CREATE TABLE IF NOT EXISTS saved_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT NOT NULL,
  character_id UUID REFERENCES character_profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS saved_prompts_user_id_idx ON saved_prompts(user_id);
-- Create index on character_id
CREATE INDEX IF NOT EXISTS saved_prompts_character_id_idx ON saved_prompts(character_id);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  UNIQUE(name, user_id)
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);

-- Character-Tag Relationship Table
CREATE TABLE IF NOT EXISTS character_tags (
  character_id UUID REFERENCES character_profiles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (character_id, tag_id)
);
