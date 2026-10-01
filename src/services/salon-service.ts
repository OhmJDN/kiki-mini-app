import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  Service, 
  BookingWithRelations, 
  Profile, 
  ServiceCategory, 
  BookingStatus,
  DepositStatus,
  Branch, 
  Stylist 
} from '../types';
import { DEMO_CUSTOMER } from '../features/auth/auth-service';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-downtown',
    name: 'Downtown Flagship Studio (สุขุมวิท 39)',
    address: '124 ซอยสุขุมวิท 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    phone: '02-123-4567',
    opening_hours: '10:00 - 20:00 น.',
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b-siam',
    name: 'Siam Premium Lounge (สยามพารากอน)',
    address: 'ชั้น 2 ศูนย์การค้าสยามพารากอน ถนนพระราม 1 ปทุมวัน กรุงเทพฯ 10330',
    phone: '02-234-5678',
    opening_hours: '10:30 - 20:30 น.',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b-bangna',
    name: 'Mega Bangna Retreat (เมกาบางนา)',
    address: 'ชั้น 1 เมกาบางนา 39 หมู่ 6 ถนนบางนา-ตราด กม.8 บางแก้ว สมุทรปราการ',
    phone: '02-345-6789',
    opening_hours: '10:00 - 21:00 น.',
    image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&auto=format&fit=crop&q=80',
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
    title: 'Nail & Wellness Therapist',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    rating: 4.97,
    review_count: 280,
    specialties: ['nails', 'spa'],
    working_days: [1, 3, 4, 5, 6, 0],
    off_dates: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'st-005',
    branch_id: 'b-bangna',
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
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's-001',
    name: 'ตัดผมสไตล์และเซ็ตทรง (Signature Haircut & Style)',
    description: 'ตัดผมออกแบบทรงตามสไตล์ที่ต้องการ โดยช่างผมมืออาชีพ พร้อมสระไดร์พรีเมียม',
    category: 'hair',
    price: 500,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-002',
    name: 'ทำสีผมพรีเมียม & ทรีทเมนต์ (Balayage & Luxury Color)',
    description: 'ทำสีผมด้วยผลิตภัณฑ์ออร์แกนิกนำเข้าจากญี่ปุ่น พร้อมทรีทเมนต์ปิดเกล็ดผมล้ำลึก',
    category: 'hair',
    price: 2500,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    deposit_required: true,
    deposit_amount: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-003',
    name: 'ทรีทเมนต์ผม เคราตินเคลือบแก้ว (Keratin Silk Gloss)',
    description: 'บำรุงผมแห้งเสียชี้ฟูให้กลับมานุ่มลื่น เงางาม มีน้ำหนักยาวนานนับเดือน',
    category: 'hair',
    price: 1500,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-004',
    name: 'ทำเล็บเจลสไตล์เกาหลี (Custom Nail Art)',
    description: 'ทำเล็บเจลสีสวยติดทนนาน ตกแต่งอะไหล่หรูหรา และดีไซน์ลายเพ้นท์ตามใจชอบ',
    category: 'nails',
    price: 890,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-005',
    name: 'สปาพาราฟินมือ & เท้า (Paraffin Hand & Foot Spa)',
    description: 'สครับขัดผิวเนียนนุ่ม พอกโคลนธรรมชาติ และอบพาราฟินบำรุงเล็บให้ชุ่มชื้น',
    category: 'nails',
    price: 650,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&auto=format&fit=crop&q=80',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-006',
    name: 'นวดอโรม่าเธอราพี ออยล์ร้อน (Aroma Relaxation Spa)',
    description: 'นวดผ่อนคลายกล้ามเนื้อด้วยน้ำมันหอมระเหยบริสุทธิ์ คลายความตึงเครียดและเมื่อยล้า',
    category: 'spa',
    price: 1290,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-007',
    name: 'สปาผิวหน้า ดีท็อกซ์ล้ำลึก (Detox & Gold Mask)',
    description: 'ทำความสะอาดรูขุมขน นวดกระตุ้นการไหลเวียนเลือด และมาส์กทองคำ 24K',
    category: 'spa',
    price: 1800,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    deposit_required: true,
    deposit_amount: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-008',
    name: 'แต่งหน้าออกงาน & เจ้าสาว VIP (Bridal & Event Glam)',
    description: 'แต่งหน้าสไตล์ลักชัวรี ติดทนนานตลอดวัน ออกแบบให้เข้ากับรูปหน้าและชุดของคุณ',
    category: 'makeup',
    price: 3200,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    deposit_required: true,
    deposit_amount: 1000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-009',
    name: 'แต่งหน้า Everyday Glam Look',
    description: 'แต่งหน้าลุคสวยธรรมชาติ ผิวฉ่ำโกลว์ เหมาะสำหรับประชุมสำคัญหรือเดทพิเศษ',
    category: 'makeup',
    price: 1500,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    deposit_required: false,
    deposit_amount: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-010',
    name: 'ทรีทเมนต์หน้า Aura Glow Skincare',
    description: 'ฟื้นฟูผิวหน้าเร่งด่วน ผลักวิตามินเข้มข้น ลดเลือนรอยสิวและริ้วรอย',
    category: 'skincare',
    price: 2000,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80',
    deposit_required: true,
    deposit_amount: 500,
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

// Local Storage Keys
const STORAGE_SERVICES_KEY = 'kiki_salon_services';
const STORAGE_BOOKINGS_KEY = 'kiki_salon_bookings';
const STORAGE_BRANCHES_KEY = 'kiki_salon_branches';
const STORAGE_STYLISTS_KEY = 'kiki_salon_stylists';

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
    const branches = [branch, ...getStoredBranches()];
    saveStoredBranches(branches);
    return branch;
  },

  async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
    const branches = getStoredBranches();
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) return null;
    branches[index] = { ...branches[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredBranches(branches);
    return branches[index];
  },

  async deleteBranch(id: string): Promise<boolean> {
    const branches = getStoredBranches().filter((b) => b.id !== id);
    saveStoredBranches(branches);
    return true;
  },

  // ================= STYLISTS =================
  async getStylists(branchId?: string): Promise<Stylist[]> {
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
    const stylists = [stylist, ...getStoredStylists()];
    saveStoredStylists(stylists);
    return stylist;
  },

  async updateStylist(id: string, updates: Partial<Stylist>): Promise<Stylist | null> {
    const stylists = getStoredStylists();
    const index = stylists.findIndex((s) => s.id === id);
    if (index === -1) return null;
    stylists[index] = { ...stylists[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredStylists(stylists);
    return stylists[index];
  },

  async deleteStylist(id: string): Promise<boolean> {
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
      deposit_status: bookingData.depositStatus || (depositAmount > 0 ? 'pending_verification' : 'none'),
      slip_url: bookingData.slipUrl || null,
      status: 'pending',
      note: bookingData.note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: primaryService,
      services: selectedServices,
      branch: selectedBranch,
      stylist: selectedStylist,
      customer: bookingData.customerProfile,
    };

    const bookings = getStoredBookings();
    const updated = [newBooking, ...bookings];
    saveStoredBookings(updated);
    return newBooking;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<BookingWithRelations | null> {
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
};
