-- ============================================
-- KIKI Beauty Salon — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE service_category AS ENUM ('hair', 'nails', 'spa', 'makeup', 'skincare');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  picture_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category service_category NOT NULL DEFAULT 'hair',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 60,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_profiles_line_user ON profiles(line_user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ---- PROFILES POLICIES ----
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---- SERVICES POLICIES ----
CREATE POLICY "Anyone can read active services"
  ON services FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  USING (is_admin());

-- ---- BOOKINGS POLICIES ----
CREATE POLICY "Customers can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id OR is_admin());

CREATE POLICY "Customers can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own pending bookings"
  ON bookings FOR UPDATE
  USING (
    (auth.uid() = customer_id AND status = 'pending')
    OR is_admin()
  );

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  USING (is_admin());

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: Sample Services
-- ============================================
INSERT INTO services (name, description, category, price, duration_minutes, image_url) VALUES
  ('ตัดผมสไตล์', 'ตัดผมออกแบบทรงตามสไตล์ที่ต้องการ โดยช่างผมมืออาชีพ', 'hair', 500, 60, null),
  ('ทำสีผม', 'ทำสีผมด้วยผลิตภัณฑ์คุณภาพสูง พร้อมทรีทเมนต์บำรุง', 'hair', 2500, 180, null),
  ('ทรีทเมนต์ผม', 'บำรุงผมเสียให้กลับมาสุขภาพดี ด้วยสูตรพิเศษ', 'hair', 1500, 90, null),
  ('ทำเล็บเจล', 'ทำเล็บเจลสีสวย ทนนาน พร้อมดีไซน์ตามใจ', 'nails', 800, 90, null),
  ('สปาเล็บ', 'ดูแลเล็บมือเล็บเท้า พร้อมมาส์กบำรุงมือ', 'nails', 600, 60, null),
  ('นวดอโรม่า', 'นวดผ่อนคลายด้วยน้ำมันหอมระเหย คลายความเมื่อยล้า', 'spa', 1200, 90, null),
  ('สปาหน้า', 'ดูแลผิวหน้าอย่างล้ำลึก ทำความสะอาดและบำรุง', 'spa', 1800, 90, null),
  ('แต่งหน้าโอกาสพิเศษ', 'แต่งหน้าสำหรับงานพิเศษ ถ่ายแบบ หรืองานแต่งงาน', 'makeup', 3000, 120, null),
  ('แต่งหน้าประจำวัน', 'สอนแต่งหน้าหรือแต่งหน้าลุคประจำวันสวยเป็นธรรมชาติ', 'makeup', 1500, 60, null),
  ('ทรีทเมนต์ผิวหน้า', 'ดูแลผิวหน้าเชิงลึก ลดริ้วรอย ผิวกระจ่างใส', 'skincare', 2000, 90, null);
