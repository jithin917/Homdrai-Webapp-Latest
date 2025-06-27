/*
  # AI Stylist Database Schema

  1. New Tables
    - `user_profiles` - User profile information and preferences
    - `design_sessions` - Conversation sessions with the AI stylist
    - `saved_designs` - User's saved design configurations
    - `design_orders` - Orders created from saved designs
    - `style_categories` - Reference data for style categories
    - `fabric_library` - Reference data for available fabrics

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Create functions for timestamp management

  3. Relationships
    - Link user profiles to Supabase auth
    - Connect designs to sessions and users
    - Link orders to designs and users
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  preferences JSONB,
  measurements JSONB,
  style_preferences TEXT[]
);

-- Design Sessions Table
CREATE TABLE IF NOT EXISTS design_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  conversation_history JSONB[],
  design_preferences JSONB,
  final_design JSONB
);

-- Saved Designs Table
CREATE TABLE IF NOT EXISTS saved_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  session_id UUID REFERENCES design_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  design_name TEXT,
  garment_type TEXT,
  fabric_details JSONB,
  color_scheme JSONB,
  measurements JSONB,
  style_elements JSONB,
  ai_generated_prompt TEXT,
  preview_image_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  collaboration_enabled BOOLEAN DEFAULT false
);

-- Design Orders Table
CREATE TABLE IF NOT EXISTS design_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID REFERENCES saved_designs(id),
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  shipping_details JSONB,
  payment_details JSONB,
  special_instructions TEXT,
  estimated_delivery_date DATE,
  tracking_number TEXT
);

-- Style Categories Table
CREATE TABLE IF NOT EXISTS style_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE,
  description TEXT,
  attributes JSONB
);

-- Fabric Library Table
CREATE TABLE IF NOT EXISTS fabric_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT,
  properties JSONB,
  available_colors TEXT[],
  price_per_yard DECIMAL,
  in_stock BOOLEAN
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own design sessions"
  ON design_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create design sessions"
  ON design_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own saved designs"
  ON saved_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved designs"
  ON saved_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
  ON design_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_design_sessions_user_id ON design_sessions(user_id);
CREATE INDEX idx_saved_designs_user_id ON saved_designs(user_id);
CREATE INDEX idx_design_orders_user_id ON design_orders(user_id);
CREATE INDEX idx_saved_designs_share_token ON saved_designs(share_token);

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_sessions_updated_at
    BEFORE UPDATE ON design_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_designs_updated_at
    BEFORE UPDATE ON saved_designs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_orders_updated_at
    BEFORE UPDATE ON design_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample style categories
INSERT INTO style_categories (name, description, attributes)
VALUES 
  ('Traditional', 'Classic Indian styles with traditional elements', '{"key_elements": ["embroidery", "traditional motifs", "rich fabrics"], "occasions": ["weddings", "festivals", "religious ceremonies"]}'),
  ('Contemporary', 'Modern designs with a fusion of traditional elements', '{"key_elements": ["clean lines", "minimalist", "fusion"], "occasions": ["parties", "casual events", "office wear"]}'),
  ('Bridal', 'Luxurious designs for wedding ceremonies', '{"key_elements": ["heavy embroidery", "zari work", "intricate details"], "occasions": ["wedding", "engagement", "reception"]}'),
  ('Casual', 'Comfortable everyday wear with style', '{"key_elements": ["comfort", "breathable fabrics", "easy maintenance"], "occasions": ["daily wear", "casual outings", "home"]}'),
  ('Festive', 'Vibrant designs for celebrations and festivals', '{"key_elements": ["bright colors", "embellishments", "statement pieces"], "occasions": ["festivals", "celebrations", "parties"]}');

-- Insert sample fabric types
INSERT INTO fabric_library (name, type, properties, available_colors, price_per_yard, in_stock)
VALUES 
  ('Pure Silk', 'Silk', '{"texture": "smooth", "weight": "medium", "drape": "excellent", "care": "dry clean only"}', ARRAY['Red', 'Blue', 'Green', 'Gold', 'Black', 'White'], 25.99, true),
  ('Cotton', 'Cotton', '{"texture": "soft", "weight": "light", "drape": "moderate", "care": "machine washable"}', ARRAY['White', 'Black', 'Blue', 'Red', 'Yellow', 'Green'], 8.99, true),
  ('Georgette', 'Synthetic', '{"texture": "sheer", "weight": "light", "drape": "excellent", "care": "gentle wash"}', ARRAY['White', 'Black', 'Red', 'Blue', 'Pink', 'Purple'], 12.99, true),
  ('Velvet', 'Velvet', '{"texture": "plush", "weight": "heavy", "drape": "moderate", "care": "dry clean only"}', ARRAY['Red', 'Blue', 'Green', 'Black', 'Purple'], 18.99, true),
  ('Chiffon', 'Synthetic', '{"texture": "sheer", "weight": "very light", "drape": "excellent", "care": "gentle wash"}', ARRAY['White', 'Black', 'Red', 'Blue', 'Pink', 'Purple'], 10.99, true),
  ('Brocade', 'Silk Blend', '{"texture": "textured", "weight": "heavy", "drape": "structured", "care": "dry clean only"}', ARRAY['Gold', 'Silver', 'Red', 'Blue', 'Green'], 29.99, true);