import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import { useAuthStore } from '@/stores/auth-store';
import type { BookingWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  PlusCircle,
  Scissors
} from 'lucide-react';

export function BookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await salonService.getBookings({ customerId: user.id });
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('คุณต้องการยกเลิกการจองคิวนี้ใช่หรือไม่?')) return;

    setCancellingId(bookingId);
    try {
      await salonService.updateBookingStatus(bookingId, 'cancelled');
      await loadBookings();
    } catch (err) {
      console.error('Cancel booking failed:', err);
      alert('ไม่สามารถยกเลิกการจองได้ โปรดติดต่อแอดมิน');
    } finally {
      setCancellingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter((b) => {
    if (b.status === 'completed' || b.status === 'cancelled') return false;
    return b.booking_date >= todayStr;
  });

  const pastBookings = bookings.filter((b) => {
    if (b.status === 'completed' || b.status === 'cancelled') return true;
    return b.booking_date < todayStr;
  });

  const currentList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 gap-1 font-medium">
            <Clock className="w-3 h-3" />
            รอการยืนยัน
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            ยืนยันคิวแล้ว
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            เข้ารับบริการแล้ว
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300 gap-1 font-medium">
            <XCircle className="w-3 h-3" />
            ยกเลิกแล้ว
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">การจองของฉัน (My Bookings)</h1>
          <p className="text-sm text-[#636260] mt-1">
            ตรวจสอบนัดหมาย และสถานะการบริการของคุณ
          </p>
        </div>

        <Button asChild className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full px-5 shadow-sm">
          <Link to="/home/services">
            <PlusCircle className="w-4 h-4 mr-2" />
            จองบริการเพิ่ม
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d4c3bc]/60">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-[#7a5646] text-[#7a5646]'
              : 'border-transparent text-[#636260] hover:text-[#1b1c1c]'
          }`}
        >
          <span>นัดหมายที่กำลังจะมาถึง</span>
          <span className="w-5 h-5 rounded-full bg-[#7a5646]/10 text-xs flex items-center justify-center font-bold">
            {upcomingBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'past'
              ? 'border-[#7a5646] text-[#7a5646]'
              : 'border-transparent text-[#636260] hover:text-[#1b1c1c]'
          }`}
        >
          <span>ประวัติการจอง</span>
          <span className="w-5 h-5 rounded-full bg-muted text-xs flex items-center justify-center font-bold text-muted-foreground">
            {pastBookings.length}
          </span>
        </button>
      </div>

      {/* Booking List */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-card/60 animate-pulse border border-[#d4c3bc]/40" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-[#d4c3bc] p-8 space-y-4">
          <CalendarIcon className="w-12 h-12 mx-auto text-[#7a5646]/40" />
          <div>
            <h3 className="font-semibold text-[#1b1c1c]">ไม่มีรายการนัดหมายในหน้านี้</h3>
            <p className="text-xs text-[#636260] mt-1">
              {activeTab === 'upcoming'
                ? 'คุณยังไม่มีนัดหมายที่กำลังจะมาถึง สามารถเลือกจองบริการได้เลย'
                : 'ยังไม่มีประวัติการจองก่อนหน้า'}
            </p>
          </div>
          {activeTab === 'upcoming' && (
            <Button asChild className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full">
              <Link to="/home/services">ดูเมนูบริการ</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden border-[#d4c3bc]/60 bg-card hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4c3bc]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#7a5646]/10 flex items-center justify-center text-[#7a5646] flex-shrink-0">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#1b1c1c]">
                        {booking.service?.name || 'บริการ KIKI Salon'}
                      </h3>
                      <p className="text-xs text-[#636260]">
                        ระยะเวลา {booking.service?.duration_minutes || 60} นาที • ฿{booking.service?.price.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>

                  <div>{renderStatusBadge(booking.status)}</div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-xs text-[#636260]">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#7a5646]" />
                    <span>
                      วันที่นัดหมาย: <strong className="text-[#1b1c1c]">{booking.booking_date}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7a5646]" />
                    <span>
                      รอบเวลา: <strong className="text-[#1b1c1c]">{booking.booking_time} น.</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7a5646]" />
                    <span>สถานที่: KIKI Beauty Space (สาขาสุขุมวิท 39)</span>
                  </div>

                  {booking.note && (
                    <div className="flex items-center gap-2 sm:col-span-2 bg-[#f5f0ea] p-2.5 rounded-xl border border-[#d4c3bc]/50 text-[#1b1c1c]">
                      <AlertCircle className="w-4 h-4 text-[#7a5646] flex-shrink-0" />
                      <span className="line-clamp-1">{booking.note}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-[#d4c3bc]/40">
                  <span className="text-[11px] text-muted-foreground">
                    รหัสการจอง: {booking.id}
                  </span>

                  <div className="flex items-center gap-2">
                    {booking.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700 rounded-full h-8"
                      >
                        {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง'}
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#7a5646]/40 text-[#7a5646] hover:bg-[#7a5646]/10 rounded-full h-8"
                    >
                      <Link to={`/home/services?book=${booking.service_id}`}>
                        จองบริการนี้ซ้ำ
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
