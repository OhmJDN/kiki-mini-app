import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Service, BookingWithRelations, Profile, ServiceCategory, BookingStatus } from '../types';
import { DEMO_CUSTOMER } from '../features/auth/auth-service';

const INITIAL_SERVICES: Service[] = [
  {
    id: 's-001',
    name: 'ตัดผมสไตล์และเซ็ตทรง',
    description: 'ตัดผมออกแบบทรงตามสไตล์ที่ต้องการ โดยช่างผมมืออาชีพ พร้อมสระไดร์พรีเมียม',
    category: 'hair',
    price: 500,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-002',
    name: 'ทำสีผมพรีเมียม & ทรีทเมนต์',
    description: 'ทำสีผมด้วยผลิตภัณฑ์ออร์แกนิกนำเข้าจากญี่ปุ่น พร้อมทรีทเมนต์ปิดเกล็ดผมล้ำลึก',
    category: 'hair',
    price: 2500,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-003',
    name: 'ทรีทเมนต์ผม เคราตินเคลือบแก้ว',
    description: 'บำรุงผมแห้งเสียชี้ฟูให้กลับมานุ่มลื่น เงางาม มีน้ำหนักยาวนานนับเดือน',
    category: 'hair',
    price: 1500,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-004',
    name: 'ทำเล็บเจลสไตล์เกาหลี (Custom Art)',
    description: 'ทำเล็บเจลสีสวยติดทนนาน ตกแต่งอะไหล่หรูหรา และดีไซน์ลายเพ้นท์ตามใจชอบ',
    category: 'nails',
    price: 890,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-005',
    name: 'สปาพาราฟินมือ & เท้า',
    description: 'สครับขัดผิวเนียนนุ่ม พอกโคลนธรรมชาติ และอบพาราฟินบำรุงเล็บให้ชุ่มชื้น',
    category: 'nails',
    price: 650,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-006',
    name: 'นวดอโรม่าเธอราพี ออยล์ร้อน',
    description: 'นวดผ่อนคลายกล้ามเนื้อด้วยน้ำมันหอมระเหยบริสุทธิ์ คลายความตึงเครียดและเมื่อยล้า',
    category: 'spa',
    price: 1290,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-007',
    name: 'สปาผิวหน้า ดีท็อกซ์ล้ำลึก',
    description: 'ทำความสะอาดรูขุมขน นวดกระตุ้นการไหลเวียนเลือด และมาส์กทองคำ 24K',
    category: 'spa',
    price: 1800,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-008',
    name: 'แต่งหน้าออกงาน & เจ้าสาว VIP',
    description: 'แต่งหน้าสไตล์ลักชัวรี ติดทนนานตลอดวัน ออกแบบให้เข้ากับรูปหน้าและชุดของคุณ',
    category: 'makeup',
    price: 3200,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
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
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_BOOKINGS: BookingWithRelations[] = [
  {
    id: 'b-001',
    customer_id: DEMO_CUSTOMER.id,
    service_id: 's-001',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    booking_time: '14:00',
    status: 'pending',
    note: 'ขอช่างผมสไตล์เกาหลีค่ะ',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    service: INITIAL_SERVICES[0],
    customer: DEMO_CUSTOMER,
  },
  {
    id: 'b-002',
    customer_id: DEMO_CUSTOMER.id,
    service_id: 's-004',
    booking_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    booking_time: '11:00',
    status: 'confirmed',
    note: 'มีลายเล็บตัวอย่างมาให้ช่างดู',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    service: INITIAL_SERVICES[3],
    customer: DEMO_CUSTOMER,
  },
  {
    id: 'b-003',
    customer_id: DEMO_CUSTOMER.id,
    service_id: 's-006',
    booking_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    booking_time: '16:00',
    status: 'completed',
    note: null,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    service: INITIAL_SERVICES[5],
    customer: DEMO_CUSTOMER,
  },
];

// Local storage keys
const STORAGE_SERVICES_KEY = 'kiki_salon_services';
const STORAGE_BOOKINGS_KEY = 'kiki_salon_bookings';

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
  // Services
  async getServices(category?: ServiceCategory | 'all'): Promise<Service[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('services').select('*').order('created_at', { ascending: true });
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
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase deleteService failed, removing locally:', e);
      }
    }

    const services = getStoredServices();
    const filtered = services.filter((s) => s.id !== id);
    saveStoredServices(filtered);
    return true;
  },

  // Bookings
  async getBookings(filters?: { customerId?: string; status?: BookingStatus | 'all' }): Promise<BookingWithRelations[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('bookings').select('*, service:services(*), customer:profiles(*)').order('booking_date', { ascending: false });
        if (filters?.customerId) {
          query = query.eq('customer_id', filters.customerId);
        }
        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as unknown as BookingWithRelations[];
        }
      } catch (err) {
        console.warn('Supabase fetch bookings failed, using local storage:', err);
      }
    }

    let bookings = getStoredBookings();
    if (filters?.customerId) {
      bookings = bookings.filter((b) => b.customer_id === filters.customerId);
    }
    if (filters?.status && filters.status !== 'all') {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    return bookings;
  },

  async createBooking(bookingData: {
    customerId: string;
    customerProfile: Profile;
    serviceId: string;
    bookingDate: string;
    bookingTime: string;
    note?: string;
  }): Promise<BookingWithRelations> {
    const services = await this.getServices();
    const service = services.find((s) => s.id === bookingData.serviceId) || services[0];

    const newBooking: BookingWithRelations = {
      id: 'b-' + Date.now(),
      customer_id: bookingData.customerId,
      service_id: bookingData.serviceId,
      booking_date: bookingData.bookingDate,
      booking_time: bookingData.bookingTime,
      status: 'pending',
      note: bookingData.note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service,
      customer: bookingData.customerProfile,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('bookings') as any).insert({
          customer_id: bookingData.customerId,
          service_id: bookingData.serviceId,
          booking_date: bookingData.bookingDate,
          booking_time: bookingData.bookingTime,
          status: 'pending',
          note: bookingData.note || null,
        }).select('*, service:services(*), customer:profiles(*)').single();

        if (!error && data) {
          return data as unknown as BookingWithRelations;
        }
      } catch (e) {
        console.warn('Supabase createBooking failed, saving locally:', e);
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
        const { data, error } = await (supabase.from('bookings') as any)
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select('*, service:services(*), customer:profiles(*)')
          .single();

        if (!error && data) {
          return data as unknown as BookingWithRelations;
        }
      } catch (e) {
        console.warn('Supabase updateBookingStatus failed, saving locally:', e);
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

  // Customers
  async getCustomers(): Promise<Array<Profile & { total_bookings: number }>> {
    const bookings = await this.getBookings();
    const customerMap = new Map<string, { profile: Profile; count: number }>();

    // Add demo customer by default
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

  // Dashboard Stats
  async getDashboardStats() {
    const bookings = await this.getBookings();
    const services = await this.getServices();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter((b) => b.booking_date === todayStr);
    const pendingBookings = bookings.filter((b) => b.status === 'pending');
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
    const completedBookings = bookings.filter((b) => b.status === 'completed');

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);
    const activeServicesCount = services.filter((s) => s.is_active).length;

    return {
      todayCount: todayBookings.length,
      pendingCount: pendingBookings.length,
      confirmedCount: confirmedBookings.length,
      completedCount: completedBookings.length,
      totalBookings: bookings.length,
      totalRevenue,
      activeServicesCount,
      recentBookings: bookings.slice(0, 5),
    };
  },
};
