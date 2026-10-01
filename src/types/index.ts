export type UserRole = 'customer' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type DepositStatus = 'none' | 'pending_verification' | 'verified' | 'rejected';

export type ServiceCategory = 'hair' | 'nails' | 'spa' | 'makeup' | 'skincare';

export interface Profile {
  id: string;
  line_user_id: string;
  display_name: string;
  picture_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_hours: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stylist {
  id: string;
  branch_id: string;
  name: string;
  title: string; // e.g. 'Master Colorist', 'Senior Hair Stylist', 'Art Director'
  avatar_url: string;
  rating: number;
  review_count: number;
  specialties: ServiceCategory[];
  working_days: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  off_dates: string[]; // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  deposit_required: boolean;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  branch_id?: string;
  service_id: string; // primary service for backward compatibility
  service_ids?: string[]; // Multipicklist for multiple services!
  stylist_id?: string; // specific stylist or 'any'
  booking_date: string;
  booking_time: string;
  total_duration_minutes: number;
  total_price: number;
  deposit_amount: number;
  deposit_status: DepositStatus;
  slip_url?: string | null;
  status: BookingStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  service?: Service;
  services?: Service[];
  branch?: Branch;
  stylist?: Stylist;
  customer?: Profile;
}

export interface BookingWithRelations extends Booking {
  service: Service;
  services?: Service[];
  branch?: Branch;
  stylist?: Stylist;
  customer: Profile;
}
