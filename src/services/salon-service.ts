import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  Service, 
  BookingWithRelations, 
  Profile, 
  ServiceCategory, 
  BookingStatus,
  DepositStatus,
  Branch, 
  Stylist,
  Promotion
} from '../types';
import { DEMO_CUSTOMER } from '../features/auth/auth-service';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-downtown',
    name: 'KIKI Beauty Space Flagship (สุขุมวิท 39)',
    address: '124 ซอยสุขุมวิท 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    phone: '096-441-5955',
    opening_hours: '10:00 - 20:00 น.',
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-07-scaled-2.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b-siam',
    name: 'KIKI Luxury Lounge (สยามพารากอน)',
    address: 'ชั้น 2 ศูนย์การค้าสยามพารากอน ถนนพระราม 1 ปทุมวัน กรุงเทพฯ 10330',
    phone: '091-798-5955',
    opening_hours: '10:30 - 20:30 น.',
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-08-scaled-1-1.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b-bangna',
    name: 'KIKI Beauty & Wellness Retreat (เมกาบางนา)',
    address: 'ชั้น 1 เมกาบางนา 39 หมู่ 6 ถนนบางนา-ตราด กม.8 บางแก้ว สมุทรปราการ',
    phone: '096-441-5955',
    opening_hours: '10:00 - 21:00 น.',
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/Contact-forms-855-x-771-px.jpg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_STYLISTS: Stylist[] = [
  {
    id: 'st-001',
    branch_id: 'b-downtown',
    name: 'Elena Rostova (ช่างเอเลน่า)',
    title: 'Master Colorist & Creative Director',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    rating: 4.95,
    review_count: 320,
    specialties: ['hair'],
    working_days: [1, 2, 3, 4, 5, 6], // Mon-Sat
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-002',
    branch_id: 'b-downtown',
    name: 'Julian Miller (ช่างจูเลียน)',
    title: 'Senior Hair Stylist & Cut Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    rating: 4.88,
    review_count: 245,
    specialties: ['hair'],
    working_days: [2, 3, 4, 5, 6, 0], // Tue-Sun
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-003',
    branch_id: 'b-siam',
    name: 'Kenji Takahashi (ช่างเคนจิ)',
    title: 'Japanese Hair Design & Perm Director',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    rating: 4.92,
    review_count: 190,
    specialties: ['hair'],
    working_days: [1, 2, 4, 5, 6, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-004',
    branch_id: 'b-downtown',
    name: 'Sarah Jenkins (ช่างซาร่าห์)',
    title: 'Nail Master & Hand Spa Therapist',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    rating: 4.97,
    review_count: 280,
    specialties: ['nails'],
    working_days: [1, 3, 4, 5, 6, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-005',
    branch_id: 'b-downtown',
    name: 'Mayura K. (ช่างมายูระ)',
    title: 'Skin Aesthetics & Facial Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    rating: 4.9,
    review_count: 160,
    specialties: ['skincare', 'makeup'],
    working_days: [1, 2, 3, 5, 6, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-006',
    branch_id: 'b-downtown',
    name: 'Aom Nattaporn (ช่างอ้อม)',
    title: 'Head Spa & Aromatherapy Master',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    rating: 4.96,
    review_count: 210,
    specialties: ['spa'],
    working_days: [1, 2, 3, 4, 5, 6],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-007',
    branch_id: 'b-siam',
    name: 'Jessica Liu (ช่างเจสสิก้า)',
    title: 'Nail Couture & Russian Manicure Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    rating: 4.91,
    review_count: 175,
    specialties: ['nails'],
    working_days: [2, 3, 4, 5, 6, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-008',
    branch_id: 'b-siam',
    name: 'Praew Panisara (ช่างแพรว)',
    title: 'Scalp Health & Organic Head Spa Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    rating: 4.94,
    review_count: 140,
    specialties: ['spa', 'skincare'],
    working_days: [1, 2, 3, 4, 5, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-009',
    branch_id: 'b-bangna',
    name: 'Benz Thitirat (ช่างเบนซ์)',
    title: 'Senior Hair Artist & Balayage Colorist',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    rating: 4.89,
    review_count: 185,
    specialties: ['hair'],
    working_days: [1, 2, 3, 4, 5, 6],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-010',
    branch_id: 'b-bangna',
    name: 'Linlada B. (ช่างหลินลดา)',
    title: 'Nail Art & Spa Wellness Therapist',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    rating: 4.93,
    review_count: 165,
    specialties: ['nails', 'spa'],
    working_days: [1, 3, 4, 5, 6, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's-001',
    name: 'Signature Haircut & Master Styling (ออกแบบทรงผม & สระไดร์พรีเมียม)',
    description: 'ตัดแต่งและดีไซน์ทรงผมโดยช่างระดับ Master ให้เข้ากับรูปหน้าและบุคลิกภาพเฉพาะตัว พร้อมบริการสระไดร์ด้วยผลิตภัณฑ์แชมพูนำเข้า',
    category: 'hair',
    price: 800,
    duration_minutes: 60,
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/1.jpg',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-002',
    name: 'KIKI Luxury Balayage & Color Couture (ทำสีผมพรีเมียม & ไฮไลท์บาลายาจ)',
    description: 'เทคนิคทำสีผมระดับสากล Balayage / Ombre / AirTouch ด้วยเม็ดสีออร์แกนิกนำเข้าจากญี่ปุ่นและยุโรป ถนอมเส้นผม สีชัดติดทน เงางามสุขภาพดี',
    category: 'hair',
    price: 3500,
    duration_minutes: 180,
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/2.jpg',
    deposit_required: true,
    deposit_amount: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-003',
    name: 'Deep Keratin Silk & Organic Scalp Detox (ทรีทเมนต์เคราตินเคลือบแก้ว & สปาดีท็อกซ์หนังศีรษะ)',
    description: 'ฟื้นฟูโครงสร้างเส้นผมแห้งเสียขั้นวิกฤต บำรุงลึกถึงแกนผมด้วยเคราตินพรีเมียมและดีท็อกซ์สารเคมีสะสม ให้ผมมีน้ำหนัก นุ่มลื่นดุจแพรไหม',
    category: 'hair',
    price: 2200,
    duration_minutes: 90,
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/3.jpg',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-004',
    name: 'Custom Nail Art & Gel Spa Therapy (ทำเล็บเจลพรีเมียม & สปามือเท้าครบวงจร)',
    description: 'ออกแบบลายเล็บเจลดีไซน์เฉพาะตัว ตกแต่งอะไหล่หรูหรา พร้อมสครับขัดผิวเนียนนุ่ม มาร์กบำรุงและอบพาราฟินเติมความชุ่มชื้น',
    category: 'nails',
    price: 990,
    duration_minutes: 90,
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/4.jpg',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-005',
    name: 'Luxury Eyelash Extension & Brow Architecture (ต่อขนตาสไตล์พรีเมียม & ออกแบบทรงคิ้ว)',
    description: 'เทคนิคต่อขนตาเส้นต่อเส้นด้วยขนมิ้งค์ญี่ปุ่น เบาสบาย ไม่ระคายเคืองตา พร้อมลิฟติ้งและจัดทรงคิ้วให้สวยละมุนอย่างเป็นธรรมชาติ',
    category: 'skincare',
    price: 1490,
    duration_minutes: 90,
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/5.jpg',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-006',
    name: 'Signature Head Spa & Aromatherapy Wellness (สปาศีรษะผ่อนคลาย & นวดอโรม่าบำบัด)',
    description: 'ศาสตร์การผ่อนคลายแบบองค์รวม นวดศีรษะกดจุดด้วยน้ำมันอโรม่าบริสุทธิ์ ชะล้างความตึงเครียด กระตุ้นการไหลเวียนเลือด และบำรุงรากผมให้แข็งแรง',
    category: 'spa',
    price: 1690,
    duration_minutes: 75,
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/6.jpg',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_BOOKINGS: BookingWithRelations[] = [
  {
    id: 'b-001',
    customer_id: DEMO_CUSTOMER.id,
    branch_id: 'b-downtown',
    service_id: 's-002',
    service_ids: ['s-002', 's-001'],
    stylist_id: 'st-001',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    booking_time: '14:00',
    total_duration_minutes: 240,
    total_price: 3000,
    deposit_amount: 500,
    deposit_status: 'pending_verification',
    slip_url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=400&auto=format&fit=crop&q=80',
    status: 'pending',
    note: 'ขอทำสีโทน Ash Brown หม่นๆ ค่ะ',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    service: INITIAL_SERVICES[1],
    services: [INITIAL_SERVICES[1], INITIAL_SERVICES[0]],
    branch: INITIAL_BRANCHES[0],
    stylist: INITIAL_STYLISTS[0],
    customer: DEMO_CUSTOMER,
  },
  {
    id: 'b-002',
    customer_id: DEMO_CUSTOMER.id,
    branch_id: 'b-downtown',
    service_id: 's-004',
    service_ids: ['s-004', 's-005'],
    stylist_id: 'st-004',
    booking_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    booking_time: '11:00',
    total_duration_minutes: 150,
    total_price: 1540,
    deposit_amount: 0,
    deposit_status: 'none',
    slip_url: null,
    status: 'confirmed',
    note: 'มีลายเล็บตัวอย่างมาให้ช่างดู',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    service: INITIAL_SERVICES[3],
    services: [INITIAL_SERVICES[3], INITIAL_SERVICES[4]],
    branch: INITIAL_BRANCHES[0],
    stylist: INITIAL_STYLISTS[3],
    customer: DEMO_CUSTOMER,
  },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-001',
    title: 'KIKI Exclusive October Glow: Signature Balayage & Hair Spa',
    description: 'โปรโมชั่นสุดพิเศษประจำเดือนตุลาคม ทำสีพรีเมียม Balayage หรือ AirTouch คู่กับ Signature Head Spa รับส่วนลดทันที 25% พร้อมรับฟรีกิ๊ฟเซ็ตเคราตินนำเข้าจากญี่ปุ่น',
    discount_text: 'ลด 25% พิเศษเฉพาะเดือนนี้',
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/2.jpg',
    banner_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-07-scaled-2.jpg',
    month: 'ตุลาคม 2569 (October 2026)',
    valid_until: '2026-10-31',
    service_ids: ['s-002', 's-006'],
    badge: '🔥 Monthly Highlight',
    is_active: true,
    terms: [
      'จำกัด 30 สิทธิ์ต่อสาขาเท่านั้น',
      'ต้องจองล่วงหน้าผ่าน LINE Mini App',
      'ไม่สามารถใช้ร่วมกับคูปองส่วนลดอื่นๆ ได้'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'promo-002',
    title: 'Autumn Elegance: Gel Nail Art & Luxury Hand Spa',
    description: 'ตกแต่งเล็บเจลสไตล์ลูกคุณหนู อะไหล่เพชรสวารอฟสกี้ไม่อั้น พร้อมสครับและมาส์กพาราฟินบำรุงล้ำลึก ในราคาพิเศษเพียง ฿1,290 (จากปกติ ฿1,800)',
    discount_text: 'แพ็กเกจพิเศษ ฿1,290',
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/4.jpg',
    banner_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-08-scaled-1-1.jpg',
    month: 'ตุลาคม 2569 (October 2026)',
    valid_until: '2026-10-31',
    service_ids: ['s-004'],
    badge: '✨ Best Seller',
    is_active: true,
    terms: [
      'รวมค่าถอดสีเจลเดิมฟรี',
      'สามารถนำแบบลายมาให้ช่างดีไซน์ได้'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'promo-003',
    title: 'New Customer Welcome: ออกแบบทรงผม Master Cut & Detox',
    description: 'สำหรับลูกค้าใหม่ที่จองคิวครั้งแรก รับสิทธิ์สัมผัสประสบการณ์ Signature Haircut โดย Director Stylist พร้อม Scalp Detox ในราคาพิเศษลดทันที 300 บาท',
    discount_text: 'ลูกค้าใหม่ ลดทันที ฿300',
    image_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/1.jpg',
    banner_url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/Contact-forms-855-x-771-px.jpg',
    month: 'ตุลาคม 2569 (October 2026)',
    valid_until: '2026-10-31',
    service_ids: ['s-001'],
    badge: '🎁 ต้อนรับลูกค้าใหม่',
    is_active: true,
    terms: [
      'เฉพาะลูกค้าที่ไม่เคยมีประวัติรับบริการที่ร้านมาก่อน',
      'สิทธิ์ 1 ท่าน / 1 ครั้ง'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Local Storage Keys
const STORAGE_SERVICES_KEY = 'kiki_salon_services';
const STORAGE_BOOKINGS_KEY = 'kiki_salon_bookings';
const STORAGE_BRANCHES_KEY = 'kiki_salon_branches';
const STORAGE_STYLISTS_KEY = 'kiki_salon_stylists';
const STORAGE_PROMOTIONS_KEY = 'kiki_salon_promotions';

const getStoredPromotions = (): Promotion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_PROMOTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROMOTIONS_KEY, JSON.stringify(INITIAL_PROMOTIONS));
      return INITIAL_PROMOTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROMOTIONS;
  }
};

const saveStoredPromotions = (promotions: Promotion[]) => {
  localStorage.setItem(STORAGE_PROMOTIONS_KEY, JSON.stringify(promotions));
};

const getStoredBranches = (): Branch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_BRANCHES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BRANCHES_KEY, JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BRANCHES;
  }
};

const saveStoredBranches = (branches: Branch[]) => {
  localStorage.setItem(STORAGE_BRANCHES_KEY, JSON.stringify(branches));
};

const getStoredStylists = (): Stylist[] => {
  try {
    const raw = localStorage.getItem(STORAGE_STYLISTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_STYLISTS_KEY, JSON.stringify(INITIAL_STYLISTS));
      return INITIAL_STYLISTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STYLISTS;
  }
};

const saveStoredStylists = (stylists: Stylist[]) => {
  localStorage.setItem(STORAGE_STYLISTS_KEY, JSON.stringify(stylists));
};

const getStoredServices = (): Service[] => {
  try {
    const raw = localStorage.getItem(STORAGE_SERVICES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SERVICES;
  }
};

const saveStoredServices = (services: Service[]) => {
  localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(services));
};

const getStoredBookings = (): BookingWithRelations[] => {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
};

const saveStoredBookings = (bookings: BookingWithRelations[]) => {
  localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
};

export const salonService = {
  // ================= BRANCHES =================
  async getBranches(): Promise<Branch[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('branches') as any)
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Branch[];
        }
      } catch (e) {
        console.warn('Supabase getBranches error, using local data:', e);
      }
    }
    return getStoredBranches();
  },

  async getBranchById(id: string): Promise<Branch | null> {
    const branches = await this.getBranches();
    return branches.find((b) => b.id === id) || null;
  },

  async createBranch(data: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
    const branch: Branch = {
      ...data,
      id: 'br-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await (supabase.from('branches') as any)
          .insert(branch)
          .select()
          .single();
        if (!error && inserted) {
          return inserted as Branch;
        }
      } catch (e) {
        console.warn('Supabase createBranch error, saving locally:', e);
      }
    }

    const branches = [branch, ...getStoredBranches()];
    saveStoredBranches(branches);
    return branch;
  },

  async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('branches') as any)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as Branch;
        }
      } catch (e) {
        console.warn('Supabase updateBranch error, saving locally:', e);
      }
    }

    const branches = getStoredBranches();
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) return null;
    branches[index] = { ...branches[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredBranches(branches);
    return branches[index];
  },

  async deleteBranch(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('branches') as any).delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteBranch error:', e);
      }
    }
    const branches = getStoredBranches().filter((b) => b.id !== id);
    saveStoredBranches(branches);
    return true;
  },

  // ================= STYLISTS =================
  async getStylists(branchId?: string): Promise<Stylist[]> {
    if (isSupabaseConfigured) {
      try {
        let query = (supabase.from('stylists') as any).select('*').order('rating', { ascending: false });
        if (branchId) {
          query = query.eq('branch_id', branchId).eq('is_active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Stylist[];
        }
      } catch (e) {
        console.warn('Supabase getStylists error, using local data:', e);
      }
    }

    const stylists = getStoredStylists();
    if (branchId) {
      return stylists.filter((s) => s.branch_id === branchId && s.is_active);
    }
    return stylists;
  },

  async getStylistById(id: string): Promise<Stylist | null> {
    const stylists = await this.getStylists();
    return stylists.find((s) => s.id === id) || null;
  },

  async createStylist(data: Omit<Stylist, 'id' | 'created_at' | 'updated_at'>): Promise<Stylist> {
    const stylist: Stylist = {
      ...data,
      id: 'st-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await (supabase.from('stylists') as any)
          .insert(stylist)
          .select()
          .single();
        if (!error && inserted) {
          return inserted as Stylist;
        }
      } catch (e) {
        console.warn('Supabase createStylist error, saving locally:', e);
      }
    }

    const stylists = [stylist, ...getStoredStylists()];
    saveStoredStylists(stylists);
    return stylist;
  },

  async updateStylist(id: string, updates: Partial<Stylist>): Promise<Stylist | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('stylists') as any)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as Stylist;
        }
      } catch (e) {
        console.warn('Supabase updateStylist error, saving locally:', e);
      }
    }

    const stylists = getStoredStylists();
    const index = stylists.findIndex((s) => s.id === id);
    if (index === -1) return null;
    stylists[index] = { ...stylists[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredStylists(stylists);
    return stylists[index];
  },

  async deleteStylist(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('stylists') as any).delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteStylist error:', e);
      }
    }
    const stylists = getStoredStylists().filter((s) => s.id !== id);
    saveStoredStylists(stylists);
    return true;
  },

  // ================= SERVICES =================
  async getServices(category?: ServiceCategory | 'all'): Promise<Service[]> {
    if (isSupabaseConfigured) {
      try {
        let query = (supabase.from('services') as any).select('*').order('created_at', { ascending: true });
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Service[];
        }
      } catch (err) {
        console.warn('Supabase fetch services failed, using local storage:', err);
      }
    }

    const localServices = getStoredServices();
    if (category && category !== 'all') {
      return localServices.filter((s) => s.category === category);
    }
    return localServices;
  },

  async getServiceById(id: string): Promise<Service | null> {
    const services = await this.getServices();
    return services.find((s) => s.id === id) || null;
  },

  async createService(newService: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const id = 's-' + Date.now();
    const service: Service = {
      ...newService,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('services') as any).insert({
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          duration_minutes: service.duration_minutes,
          image_url: service.image_url,
          deposit_required: service.deposit_required,
          deposit_amount: service.deposit_amount,
          is_active: service.is_active,
        }).select().single();

        if (!error && data) {
          return data as Service;
        }
      } catch (e) {
        console.warn('Supabase createService failed, saving locally:', e);
      }
    }

    const services = getStoredServices();
    const updated = [service, ...services];
    saveStoredServices(updated);
    return service;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('services') as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as Service;
        }
      } catch (e) {
        console.warn('Supabase updateService failed, saving locally:', e);
      }
    }

    const services = getStoredServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    services[index] = { ...services[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredServices(services);
    return services[index];
  },

  async deleteService(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await (supabase.from('services') as any).delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteService failed, removing locally:', e);
      }
    }

    const services = getStoredServices().filter((s) => s.id !== id);
    saveStoredServices(services);
    return true;
  },

  // ================= BOOKINGS =================
  async getBookings(filters?: { 
    customerId?: string; 
    status?: BookingStatus | 'all'; 
    branchId?: string;
    stylistId?: string;
    depositStatus?: DepositStatus | 'all';
  }): Promise<BookingWithRelations[]> {
    if (isSupabaseConfigured) {
      try {
        let query = (supabase.from('bookings') as any).select('*').order('created_at', { ascending: false });
        if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
        if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
        if (filters?.branchId && filters.branchId !== 'all') query = query.eq('branch_id', filters.branchId);
        if (filters?.stylistId && filters.stylistId !== 'all') query = query.eq('stylist_id', filters.stylistId);
        if (filters?.depositStatus && filters.depositStatus !== 'all') query = query.eq('deposit_status', filters.depositStatus);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const allServices = await this.getServices();
          const allBranches = await this.getBranches();
          const allStylists = await this.getStylists();

          return data.map((b: any) => {
            const svcIds = b.service_ids || (b.service_id ? [b.service_id] : []);
            const matchedServices = allServices.filter((s) => svcIds.includes(s.id));
            const primaryService = matchedServices[0] || allServices.find((s) => s.id === b.service_id) || allServices[0];
            const branch = allBranches.find((br) => br.id === b.branch_id);
            const stylist = allStylists.find((st) => st.id === b.stylist_id);

            return {
              ...b,
              services: matchedServices,
              service: primaryService,
              branch,
              stylist,
              customer: b.customer_profile || DEMO_CUSTOMER,
            } as BookingWithRelations;
          });
        }
      } catch (e) {
        console.warn('Supabase getBookings error, using local data:', e);
      }
    }

    let bookings = getStoredBookings();
    if (filters?.customerId) {
      bookings = bookings.filter((b) => b.customer_id === filters.customerId);
    }
    if (filters?.status && filters.status !== 'all') {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    if (filters?.branchId && filters.branchId !== 'all') {
      bookings = bookings.filter((b) => b.branch_id === filters.branchId);
    }
    if (filters?.stylistId && filters.stylistId !== 'all') {
      bookings = bookings.filter((b) => b.stylist_id === filters.stylistId);
    }
    if (filters?.depositStatus && filters.depositStatus !== 'all') {
      bookings = bookings.filter((b) => b.deposit_status === filters.depositStatus);
    }
    return bookings;
  },

  async createBooking(bookingData: {
    customerId: string;
    customerProfile: Profile;
    branchId?: string;
    serviceIds: string[];
    stylistId?: string;
    bookingDate: string;
    bookingTime: string;
    depositAmount?: number;
    depositStatus?: DepositStatus;
    slipUrl?: string | null;
    note?: string;
  }): Promise<BookingWithRelations> {
    const allServices = await this.getServices();
    const selectedServices = allServices.filter((s) => bookingData.serviceIds.includes(s.id));
    const primaryService = selectedServices[0] || allServices[0];

    const branches = await this.getBranches();
    const selectedBranch = branches.find((b) => b.id === bookingData.branchId) || branches[0];

    const stylists = await this.getStylists();
    const selectedStylist = stylists.find((s) => s.id === bookingData.stylistId);

    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const depositAmount = bookingData.depositAmount ?? selectedServices.reduce((max, s) => Math.max(max, s.deposit_amount), 0);

    const hasSlip = Boolean(bookingData.slipUrl);
    const initialDepositStatus: DepositStatus = bookingData.depositStatus || (
      hasSlip ? 'verified' : (depositAmount > 0 ? 'pending_verification' : 'none')
    );
    const initialStatus: BookingStatus = (hasSlip || depositAmount === 0) ? 'confirmed' : 'pending';

    const newBooking: BookingWithRelations = {
      id: 'b-' + Date.now(),
      customer_id: bookingData.customerId,
      branch_id: selectedBranch.id,
      service_id: primaryService.id,
      service_ids: bookingData.serviceIds,
      stylist_id: bookingData.stylistId || 'any',
      booking_date: bookingData.bookingDate,
      booking_time: bookingData.bookingTime,
      total_duration_minutes: totalDuration,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      deposit_status: initialDepositStatus,
      slip_url: bookingData.slipUrl || null,
      status: initialStatus,
      note: bookingData.note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: primaryService,
      services: selectedServices,
      branch: selectedBranch,
      stylist: selectedStylist,
      customer: bookingData.customerProfile,
    };

    if (isSupabaseConfigured) {
      try {
        await (supabase.from('bookings') as any).insert({
          id: newBooking.id,
          customer_id: newBooking.customer_id,
          customer_profile: newBooking.customer,
          branch_id: newBooking.branch_id,
          service_id: newBooking.service_id,
          service_ids: newBooking.service_ids,
          stylist_id: newBooking.stylist_id,
          booking_date: newBooking.booking_date,
          booking_time: newBooking.booking_time,
          total_duration_minutes: newBooking.total_duration_minutes,
          total_price: newBooking.total_price,
          deposit_amount: newBooking.deposit_amount,
          deposit_status: newBooking.deposit_status,
          slip_url: newBooking.slip_url,
          status: newBooking.status,
          note: newBooking.note,
        });
      } catch (e) {
        console.warn('Supabase createBooking error, saving locally:', e);
      }
    }

    const bookings = getStoredBookings();
    const updated = [newBooking, ...bookings];
    saveStoredBookings(updated);
    return newBooking;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<BookingWithRelations | null> {
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('bookings') as any)
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', bookingId);
      } catch (e) {
        console.warn('Supabase updateBookingStatus error:', e);
      }
    }

    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status,
      updated_at: new Date().toISOString(),
    };
    saveStoredBookings(bookings);
    return bookings[index];
  },

  async verifyDepositSlip(bookingId: string, status: 'verified' | 'rejected'): Promise<BookingWithRelations | null> {
    const newStatus = status === 'verified' ? 'confirmed' : 'pending';
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('bookings') as any)
          .update({ 
            deposit_status: status, 
            status: newStatus,
            updated_at: new Date().toISOString() 
          })
          .eq('id', bookingId);
      } catch (e) {
        console.warn('Supabase verifyDepositSlip error:', e);
      }
    }

    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      deposit_status: status,
      status: status === 'verified' ? 'confirmed' : bookings[index].status,
      updated_at: new Date().toISOString(),
    };
    saveStoredBookings(bookings);
    return bookings[index];
  },

  async rescheduleBooking(bookingId: string, newDate: string, newTime: string): Promise<BookingWithRelations | null> {
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('bookings') as any)
          .update({ 
            booking_date: newDate, 
            booking_time: newTime,
            status: 'pending',
            updated_at: new Date().toISOString() 
          })
          .eq('id', bookingId);
      } catch (e) {
        console.warn('Supabase rescheduleBooking error:', e);
      }
    }

    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      booking_date: newDate,
      booking_time: newTime,
      status: 'pending', // Re-verify status
      updated_at: new Date().toISOString(),
    };
    saveStoredBookings(bookings);
    return bookings[index];
  },

  // ================= CUSTOMERS & STATS =================
  async getCustomers(): Promise<Array<Profile & { total_bookings: number }>> {
    const bookings = await this.getBookings();
    const customerMap = new Map<string, { profile: Profile; count: number }>();

    customerMap.set(DEMO_CUSTOMER.id, {
      profile: DEMO_CUSTOMER,
      count: 0,
    });

    bookings.forEach((b) => {
      if (b.customer) {
        const existing = customerMap.get(b.customer_id);
        if (existing) {
          existing.count += 1;
        } else {
          customerMap.set(b.customer_id, {
            profile: b.customer,
            count: 1,
          });
        }
      }
    });

    return Array.from(customerMap.values()).map(({ profile, count }) => ({
      ...profile,
      total_bookings: count,
    }));
  },

  async getDashboardStats() {
    const bookings = await this.getBookings();
    const services = await this.getServices();
    const stylists = await this.getStylists();
    const branches = await this.getBranches();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter((b) => b.booking_date === todayStr);
    const pendingBookings = bookings.filter((b) => b.status === 'pending');
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
    const pendingSlips = bookings.filter((b) => b.deposit_status === 'pending_verification');
    const completedBookings = bookings.filter((b) => b.status === 'completed');

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || b.service?.price || 0), 0);
    const activeServicesCount = services.filter((s) => s.is_active).length;
    const activeStylistsCount = stylists.filter((s) => s.is_active).length;

    return {
      todayCount: todayBookings.length,
      pendingCount: pendingBookings.length,
      confirmedCount: confirmedBookings.length,
      pendingSlipsCount: pendingSlips.length,
      completedCount: completedBookings.length,
      totalBookings: bookings.length,
      totalRevenue,
      activeServicesCount,
      activeStylistsCount,
      branchesCount: branches.length,
      recentBookings: bookings.slice(0, 6),
    };
  },

  // ================= PROMOTIONS =================
  async getPromotions(): Promise<Promotion[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('promotions') as any)
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Promotion[];
        }
      } catch (e) {
        console.warn('Supabase getPromotions error, using local data:', e);
      }
    }
    return getStoredPromotions();
  },

  async createPromotion(data: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<Promotion> {
    const newPromo: Promotion = {
      ...data,
      id: 'promo-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await (supabase.from('promotions') as any)
          .insert(newPromo)
          .select()
          .single();
        if (!error && inserted) {
          return inserted as Promotion;
        }
      } catch (e) {
        console.warn('Supabase createPromotion error:', e);
      }
    }

    const promos = [newPromo, ...getStoredPromotions()];
    saveStoredPromotions(promos);
    return newPromo;
  },

  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('promotions') as any)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as Promotion;
        }
      } catch (e) {
        console.warn('Supabase updatePromotion error:', e);
      }
    }

    const promos = getStoredPromotions();
    const index = promos.findIndex((p) => p.id === id);
    if (index === -1) return null;
    promos[index] = { ...promos[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredPromotions(promos);
    return promos[index];
  },

  async deletePromotion(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('promotions') as any).delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deletePromotion error:', e);
      }
    }
    const promos = getStoredPromotions().filter((p) => p.id !== id);
    saveStoredPromotions(promos);
    return true;
  },

  // ================= PROFILE UPDATES =================
  async updateCustomerProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('profiles') as any)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as Profile;
        }
      } catch (e) {
        console.warn('Supabase updateCustomerProfile error:', e);
      }
    }

    // Also update any customer in local bookings
    const bookings = getStoredBookings();
    bookings.forEach((b) => {
      if (b.customer_id === id && b.customer) {
        b.customer = { ...b.customer, ...updates, updated_at: new Date().toISOString() };
      }
    });
    saveStoredBookings(bookings);

    return null;
  },
};
