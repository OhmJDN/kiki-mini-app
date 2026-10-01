export type UserRole = 'customer' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

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

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  service?: Service;
  customer?: Profile;
}

export interface BookingWithRelations extends Booking {
  service: Service;
  customer: Profile;
}
