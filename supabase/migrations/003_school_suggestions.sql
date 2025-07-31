-- Create school_suggestions table
CREATE TABLE IF NOT EXISTS school_suggestions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  school_type TEXT NOT NULL CHECK (school_type IN ('undergraduate', 'medical')),
  location_city TEXT,
  location_state TEXT,
  website_url TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE school_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own suggestions" ON school_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create suggestions" ON school_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending suggestions" ON school_suggestions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin policy (will need to be updated with specific admin user IDs)
CREATE POLICY "Admins can view all suggestions" ON school_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@medatlas.com') -- Add admin emails here
    )
  );

CREATE POLICY "Admins can update all suggestions" ON school_suggestions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@medatlas.com') -- Add admin emails here
    )
  );

-- Create indexes for performance
CREATE INDEX idx_school_suggestions_user_id ON school_suggestions(user_id);
CREATE INDEX idx_school_suggestions_status ON school_suggestions(status);
CREATE INDEX idx_school_suggestions_created_at ON school_suggestions(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_school_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER school_suggestions_updated_at
  BEFORE UPDATE ON school_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_school_suggestions_updated_at();