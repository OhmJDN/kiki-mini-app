export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          line_user_id: string;
          display_name: string;
          picture_url: string | null;
          phone: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_user_id: string;
          display_name: string;
          picture_url?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          line_user_id?: string;
          display_name?: string;
          picture_url?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin';
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          price: number;
          duration_minutes: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          price: number;
          duration_minutes: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          price?: number;
          duration_minutes?: number;
          image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          service_id: string;
          booking_date: string;
          booking_time: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          service_id: string;
          booking_date: string;
          booking_time: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          service_id?: string;
          booking_date?: string;
          booking_time?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          note?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
