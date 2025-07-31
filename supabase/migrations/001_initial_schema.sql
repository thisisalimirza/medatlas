-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create places table
CREATE TABLE places (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('school','rotation','residency')) NOT NULL,
  institution TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  photo_url TEXT,
  tags JSONB NOT NULL DEFAULT '[]',
  rank_overall REAL,
  metrics JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  stage TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE user_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mcat INTEGER,
  gpa REAL,
  state TEXT,
  research_months INTEGER DEFAULT 0,
  clinical_hours INTEGER DEFAULT 0,
  volunteer_hours INTEGER DEFAULT 0,
  shadowing_hours INTEGER DEFAULT 0,
  leadership BOOLEAN DEFAULT FALSE,
  publications INTEGER DEFAULT 0,
  specialty_interest TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create school_list table
CREATE TABLE school_list (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  place_id BIGINT REFERENCES places(id) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reach', 'target', 'safety')),
  acceptance_odds REAL DEFAULT 0,
  notes TEXT,
  application_status TEXT DEFAULT 'planning' CHECK (
    application_status IN (
      'planning', 'primary_submitted', 'secondary_received', 
      'secondary_submitted', 'interview_invite', 'interviewed', 
      'accepted', 'waitlisted', 'rejected'
    )
  ),
  added_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Create checkins table
CREATE TABLE checkins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  place_id BIGINT REFERENCES places(id) NOT NULL,
  status TEXT CHECK(status IN ('now','soon','been')) NOT NULL,
  private BOOLEAN DEFAULT FALSE,
  eta_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id, status)
);

-- Create reviews table
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  place_id BIGINT REFERENCES places(id) NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Create photos table
CREATE TABLE photos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  place_id BIGINT REFERENCES places(id) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  place_id BIGINT REFERENCES places(id) NOT NULL,
  notes TEXT,
  application_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Create payments table
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_places_type ON places(type);
CREATE INDEX idx_places_location ON places(country, state, city);
CREATE INDEX idx_places_rank ON places(rank_overall);
CREATE INDEX idx_checkins_place ON checkins(place_id, status);
CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_school_list_user ON school_list(user_id);
CREATE INDEX idx_school_list_category ON school_list(category);

-- Enable full-text search on places
CREATE INDEX places_search_idx ON places USING GIN (
  to_tsvector('english', name || ' ' || city || ' ' || COALESCE(institution, ''))
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_stats
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for school_list
CREATE POLICY "Users can manage own school list" ON school_list FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for checkins
CREATE POLICY "Users can manage own checkins" ON checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public checkins are viewable" ON checkins FOR SELECT USING (NOT private);

-- RLS Policies for reviews
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Reviews are publicly viewable" ON reviews FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for photos
CREATE POLICY "Users can manage own photos" ON photos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Photos are publicly viewable" ON photos FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for favorites
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Places table is publicly readable but only admins can modify
CREATE POLICY "Places are publicly viewable" ON places FOR SELECT TO authenticated, anon USING (true);

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, stage)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'stage', 'premed'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_list_updated_at BEFORE UPDATE ON school_list FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();