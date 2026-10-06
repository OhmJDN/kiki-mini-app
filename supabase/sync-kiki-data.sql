-- KIKI Beauty Space: sync authentic branches & services
-- Paste into Supabase SQL Editor and click Run. Safe to re-run (upsert by id).

insert into public.branches (id, name, address, phone, opening_hours, image_url, is_active) values
('b-downtown', 'KIKI Beauty Space Flagship (สุขุมวิท 39)', '124 ซอยสุขุมวิท 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110', '096-441-5955', '10:00 - 20:00 น.', 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-07-scaled-2.jpg', true),
('b-siam', 'KIKI Luxury Lounge (สยามพารากอน)', 'ชั้น 2 ศูนย์การค้าสยามพารากอน ถนนพระราม 1 ปทุมวัน กรุงเทพฯ 10330', '091-798-5955', '10:30 - 20:30 น.', 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-08-scaled-1-1.jpg', true),
('b-bangna', 'KIKI Beauty & Wellness Retreat (เมกาบางนา)', 'ชั้น 1 เมกาบางนา 39 หมู่ 6 ถนนบางนา-ตราด กม.8 บางแก้ว สมุทรปราการ', '096-441-5955', '10:00 - 21:00 น.', 'https://kikibeautyspace.com/wp-content/uploads/2025/01/Contact-forms-855-x-771-px.jpg', true)
on conflict (id) do update set
  name = excluded.name, address = excluded.address, phone = excluded.phone,
  opening_hours = excluded.opening_hours, image_url = excluded.image_url,
  is_active = excluded.is_active, updated_at = now();

insert into public.services (id, name, description, category, price, duration_minutes, image_url, deposit_required, deposit_amount, is_active) values
('s-001', 'Signature Haircut & Master Styling (ออกแบบทรงผม & สระไดร์พรีเมียม)', 'ตัดแต่งและดีไซน์ทรงผมโดยช่างระดับ Master ให้เข้ากับรูปหน้าและบุคลิกภาพเฉพาะตัว พร้อมบริการสระไดร์ด้วยผลิตภัณฑ์แชมพูนำเข้า', 'hair', 800, 60, 'https://kikibeautyspace.com/wp-content/uploads/2025/01/1.jpg', false, 0, true),
('s-002', 'KIKI Luxury Balayage & Color Couture (ทำสีผมพรีเมียม & ไฮไลท์บาลายาจ)', 'เทคนิคทำสีผมระดับสากล Balayage / Ombre / AirTouch ด้วยเม็ดสีออร์แกนิกนำเข้าจากญี่ปุ่นและยุโรป ถนอมเส้นผม สีชัดติดทน เงางามสุขภาพดี', 'hair', 3500, 180, 'https://kikibeautyspace.com/wp-content/uploads/2025/01/2.jpg', true, 500, true),
('s-003', 'Deep Keratin Silk & Organic Scalp Detox (ทรีทเมนต์เคราตินเคลือบแก้ว & สปาดีท็อกซ์หนังศีรษะ)', 'ฟื้นฟูโครงสร้างเส้นผมแห้งเสียขั้นวิกฤต บำรุงลึกถึงแกนผมด้วยเคราตินพรีเมียมและดีท็อกซ์สารเคมีสะสม ให้ผมมีน้ำหนัก นุ่มลื่นดุจแพรไหม', 'hair', 2200, 90, 'https://kikibeautyspace.com/wp-content/uploads/2025/01/3.jpg', false, 0, true),
('s-004', 'Custom Nail Art & Gel Spa Therapy (ทำเล็บเจลพรีเมียม & สปามือเท้าครบวงจร)', 'ออกแบบลายเล็บเจลดีไซน์เฉพาะตัว ตกแต่งอะไหล่หรูหรา พร้อมสครับขัดผิวเนียนนุ่ม มาร์กบำรุงและอบพาราฟินเติมความชุ่มชื้น', 'nails', 990, 90, 'https://kikibeautyspace.com/wp-content/uploads/2025/01/4.jpg', false, 0, true),
('s-005', 'Luxury Eyelash Extension & Brow Architecture (ต่อขนตาสไตล์พรีเมียม & ออกแบบทรงคิ้ว)', 'เทคนิคต่อขนตาเส้นต่อเส้นด้วยขนมิ้งค์ญี่ปุ่น เบาสบาย ไม่ระคายเคืองตา พร้อมลิฟติ้งและจัดทรงคิ้วให้สวยละมุนอย่างเป็นธรรมชาติ', 'skincare', 1490, 90, 'https://kikibeautyspace.com/wp-content/uploads/2025/01/5.jpg', false, 0, true),
('s-006', 'Signature Head Spa & Aromatherapy Wellness (สปาศีรษะผ่อนคลาย & นวดอโรม่าบำบัด)', 'ศาสตร์การผ่อนคลายแบบองค์รวม นวดศีรษะกดจุดด้วยน้ำมันอโรม่าบริสุทธิ์ ชะล้างความตึงเครียด กระตุ้นการไหลเวียนเลือด และบำรุงรากผมให้แข็งแรง', 'spa', 1690, 75, 'https://kikibeautyspace.com/wp-content/uploads/2025/01/6.jpg', false, 0, true)
on conflict (id) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  price = excluded.price, duration_minutes = excluded.duration_minutes, image_url = excluded.image_url,
  deposit_required = excluded.deposit_required, deposit_amount = excluded.deposit_amount,
  is_active = excluded.is_active, updated_at = now();
