-- Create summer_programs table
CREATE TABLE IF NOT EXISTS summer_programs (
  id SERIAL PRIMARY KEY,
  program_name TEXT NOT NULL,
  host_institution TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  application_deadline TEXT,
  stipend_funding TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_summer_programs_institution ON summer_programs(host_institution);
CREATE INDEX IF NOT EXISTS idx_summer_programs_deadline ON summer_programs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_summer_programs_name ON summer_programs USING gin(to_tsvector('english', program_name));

-- Enable RLS
ALTER TABLE summer_programs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for everyone" ON summer_programs
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for service role" ON summer_programs
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow update for service role" ON summer_programs
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_summer_programs_updated_at
    BEFORE UPDATE ON summer_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();