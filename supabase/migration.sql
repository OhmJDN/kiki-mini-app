-- ============================================
-- KIKI Beauty Space — Complete Supabase Database Schema
-- Production Schema: Multi-branch, Multi-stylist, Multipicklist, PromptPay Deposit
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUM TYPES
-- ============================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deposit_status AS ENUM ('none', 'pending_verification', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE service_category AS ENUM ('hair', 'nails', 'spa', 'makeup', 'skincare');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. PROFILES TABLE (Customers & Admins)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  picture_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 3. BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY DEFAULT ('br-' || floor(random() * 1000000)::text),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '02-123-4567',
  opening_hours TEXT NOT NULL DEFAULT '10:00 - 20:00 น.',
  image_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 4. STYLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stylists (
  id TEXT PRIMARY KEY DEFAULT ('st-' || floor(random() * 1000000)::text),
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Senior Hair Stylist',
  avatar_url TEXT NOT NULL DEFAULT '',
  rating DECIMAL(3,2) NOT NULL DEFAULT 4.90,
  review_count INT NOT NULL DEFAULT 150,
  specialties TEXT[] NOT NULL DEFAULT ARRAY['hair'],
  working_days INT[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5, 6, 0], -- 0=Sun, 1=Mon..
  off_dates TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- YYYY-MM-DD
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 5. SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY DEFAULT ('s-' || floor(random() * 1000000)::text),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category service_category NOT NULL DEFAULT 'hair',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 60,
  image_url TEXT,
  deposit_required BOOLEAN DEFAULT FALSE NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 6. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT ('bk-' || floor(random() * 1000000)::text),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_profile JSONB,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  service_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  stylist_id TEXT DEFAULT 'any',
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  total_duration_minutes INT NOT NULL DEFAULT 60,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_status deposit_status DEFAULT 'none' NOT NULL,
  slip_url TEXT,
  status booking_status DEFAULT 'pending' NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 7. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_branch ON bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_deposit_status ON bookings(deposit_status);
CREATE INDEX IF NOT EXISTS idx_stylists_branch ON stylists(branch_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_profiles_line_user ON profiles(line_user_id);

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read / write policies for Mini App client
CREATE POLICY "Public full access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read active branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Admin manage branches" ON branches FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read active stylists" ON stylists FOR SELECT USING (true);
CREATE POLICY "Admin manage stylists" ON stylists FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read active services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin manage services" ON services FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access to bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 9. INITIAL SEED DATA
-- ============================================

-- Branches
INSERT INTO branches (id, name, address, phone, opening_hours, image_url, is_active)
VALUES
  ('b-siam', 'KIKI Siam Flagship (สยามสแควร์วัน ชั้น 3)', '388 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330', '02-111-2233', '10:00 - 20:30 น.', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80', true),
  ('b-downtown', 'KIKI Downtown (เอ็มควอเทียร์ อาคาร Helix ชั้น 4)', '693 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110', '02-222-3344', '10:00 - 20:00 น.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80', true),
  ('b-bangna', 'KIKI Mega Bangna (โซน Mega Wellness ชั้น 2)', '39 หมู่ที่ 6 บางนา-ตราด กม.8 ต.บางแก้ว อ.บางพลี สมุทรปราการ 10540', '02-333-4455', '10:30 - 21:00 น.', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- Stylists
INSERT INTO stylists (id, branch_id, name, title, avatar_url, rating, review_count, specialties, working_days, off_dates, is_active)
VALUES
  ('st-001', 'b-siam', 'Elena Vance (ช่างเอเลน่า)', 'Creative Color Director & Master Stylist', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 4.95, 312, ARRAY['hair'], ARRAY[1, 2, 3, 4, 5, 6], ARRAY[]::TEXT[], true),
  ('st-002', 'b-siam', 'Marco Rossi (ช่างมาร์โก้)', 'Senior Hair Stylist & Cut Specialist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 4.88, 245, ARRAY['hair'], ARRAY[2, 3, 4, 5, 6, 0], ARRAY[]::TEXT[], true),
  ('st-003', 'b-siam', 'Kenji Takahashi (ช่างเคนจิ)', 'Japanese Hair Design & Perm Director', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', 4.92, 190, ARRAY['hair'], ARRAY[1, 2, 4, 5, 6, 0], ARRAY[]::TEXT[], true),
  ('st-004', 'b-downtown', 'Sarah Jenkins (ช่างซาร่าห์)', 'Nail & Wellness Therapist', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', 4.97, 280, ARRAY['nails', 'spa'], ARRAY[1, 3, 4, 5, 6, 0], ARRAY[]::TEXT[], true),
  ('st-005', 'b-bangna', 'Mayura K. (ช่างมายูระ)', 'Skin Aesthetics & Facial Specialist', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', 4.90, 160, ARRAY['skincare', 'makeup'], ARRAY[1, 2, 3, 5, 6, 0], ARRAY[]::TEXT[], true)
ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO services (id, name, description, category, price, duration_minutes, image_url, deposit_required, deposit_amount, is_active)
VALUES
  ('s-001', 'Balayage & Couture Hair Color', 'บริการทำสีผมบาลายาจเทคนิคฝรั่งเศส ปรับไล่เฉดสีเนียนเป็นธรรมชาติ พร้อมทรีตเมนต์บำรุงผม', 'hair', 4500, 150, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80', true, 500, true),
  ('s-002', 'Signature Haircut & Scalp Detox', 'ออกแบบทรงผมระดับพรีเมียม สระนวดกดจุดสปาศีรษะ และดีท็อกซ์หนังศีรษะด้วยอโรมาออยล์', 'hair', 1200, 60, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80', false, 0, true),
  ('s-003', 'Japanese Volume Digital Perm', 'ดัดดิจิตอลสไตล์ญี่ปุ่น ลอนผมมีวอลลุ่ม นุ่มสลวย เซ็ตทรงง่าย ไม่ทำร้ายโครงสร้างเส้นผม', 'hair', 3800, 120, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80', true, 500, true),
  ('s-004', 'Aura Luxury Spa Manicure & Pedicure', 'สปาดูแลเล็บมือและเท้าแบบครบวงจร ขัดผิว พอกโคลนธรรมชาติ และทาสีเจลเกรดพรีเมียมนำเข้า', 'nails', 1500, 75, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80', false, 0, true),
  ('s-005', 'Ultimate Deep Cleansing & Glowing Facial', 'ปรนนิบัติผิวหน้าล้ำลึก 10 ขั้นตอน ผลัดเซลล์ผิว เติมไฮยาลูรอน และนวดฟื้นฟูผิวหน้ากระจ่างใส', 'skincare', 2200, 75, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80', true, 300, true),
  ('s-006', 'Aromatherapy Relaxing Body Spa', 'นวดผ่อนคลายกล้ามเนื้อทั่วเรือนร่างด้วยน้ำมันหอมระเหยออร์แกนิก ปรับสมดุลร่างกายและจิตใจ', 'spa', 2800, 90, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80', true, 500, true)
ON CONFLICT (id) DO NOTHING;
