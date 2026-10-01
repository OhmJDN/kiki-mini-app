import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import { useAuthStore } from '@/stores/auth-store';
import type { BookingWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle,
  Scissors,
  User,
  RefreshCw,
  X
} from 'lucide-react';

const TIME_SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '18:30'];

export function BookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Reschedule Modal State
  const [reschedulingBooking, setReschedulingBooking] = useState<BookingWithRelations | null>(null);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('14:30');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

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

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBooking) return;

    setIsSubmittingReschedule(true);
    try {
      await salonService.rescheduleBooking(reschedulingBooking.id, newDate, newTime);
      setReschedulingBooking(null);
      await loadBookings();
      alert('เลื่อนเวลานัดหมายเรียบร้อยแล้ว แอดมินจะทำการยืนยันคิวใหม่ให้โดยเร็วครับ');
    } catch (err) {
      console.error('Reschedule failed:', err);
      alert('เกิดข้อผิดพลาดในการเลื่อนนัด');
    } finally {
      setIsSubmittingReschedule(false);
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

  const renderStatusBadge = (status: string, depositStatus?: string) => {
    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {status === 'pending' && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 gap-1 text-[10px]">
            <Clock className="w-3 h-3" />
            รอยืนยันคิว
          </Badge>
        )}
        {status === 'confirmed' && (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            ยืนยันคิวแล้ว
          </Badge>
        )}
        {status === 'completed' && (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px]">
            รับบริการแล้ว
          </Badge>
        )}
        {status === 'cancelled' && (
          <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">
            ยกเลิกแล้ว
          </Badge>
        )}

        {depositStatus === 'pending_verification' && (
          <Badge variant="outline" className="border-amber-400 text-amber-800 text-[9px]">
            สลิปรอตรวจสอบ
          </Badge>
        )}
        {depositStatus === 'verified' && (
          <Badge variant="outline" className="border-emerald-500 text-emerald-800 text-[9px]">
            มัดจำแล้ว
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">การจองของฉัน (My Bookings)</h1>
          <p className="text-sm text-[#636260] mt-1">
            ตรวจสอบนัดหมาย เลื่อนวันเวลา หรือขอยกเลิกการจอง
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

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-card animate-pulse border border-[#d4c3bc]/40" />
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
          {currentList.map((booking) => {
            const serviceList = booking.services && booking.services.length > 0 ? booking.services : [booking.service];
            const serviceNames = serviceList.map((s) => s?.name).filter(Boolean).join(' + ');

            return (
              <Card
                key={booking.id}
                className="overflow-hidden border-[#d4c3bc]/60 bg-card hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#d4c3bc]/40">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#7a5646]/10 flex items-center justify-center text-[#7a5646] flex-shrink-0">
                        <Scissors className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[#1b1c1c]">
                          {serviceNames || 'บริการ KIKI Beauty Space'}
                        </h3>
                        <p className="text-xs text-[#636260]">
                          รวม {booking.total_duration_minutes || booking.service?.duration_minutes || 60} นาที • ฿{(booking.total_price || booking.service?.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>{renderStatusBadge(booking.status, booking.deposit_status)}</div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3.5 text-xs text-[#636260]">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#7a5646]" />
                      <span>
                        วัน-เวลา: <strong className="text-[#1b1c1c]">{booking.booking_date} เวลา {booking.booking_time} น.</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#7a5646]" />
                      <span>
                        ช่างผู้ให้บริการ: <strong className="text-[#1b1c1c]">{booking.stylist?.name || 'ช่างคนไหนก็ได้ (First Available)'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#7a5646]" />
                      <span>สาขา: <strong className="text-[#1b1c1c]">{booking.branch?.name || 'สุขุมวิท 39 (Flagship)'}</strong></span>
                    </div>

                    {booking.deposit_amount > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#7a5646]" />
                        <span>ยอดมัดจำ: <strong className="text-amber-800">฿{booking.deposit_amount.toLocaleString()}</strong> ({booking.deposit_status === 'verified' ? 'ยืนยันแล้ว' : 'รอยืนยันสลิป'})</span>
                      </div>
                    )}

                    {booking.note && (
                      <div className="flex items-center gap-2 sm:col-span-2 bg-[#f5f0ea] p-2.5 rounded-xl border border-[#d4c3bc]/50 text-[#1b1c1c]">
                        <AlertCircle className="w-4 h-4 text-[#7a5646] flex-shrink-0" />
                        <span className="line-clamp-1">{booking.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#d4c3bc]/40">
                    <span className="text-[11px] text-muted-foreground">
                      รหัสการจอง: {booking.id}
                    </span>

                    <div className="flex items-center gap-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReschedulingBooking(booking);
                              setNewDate(booking.booking_date);
                              setNewTime(booking.booking_time);
                            }}
                            className="text-xs text-[#7a5646] border-[#7a5646]/40 hover:bg-[#7a5646]/10 rounded-full h-8 px-3"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            เลื่อนนัดหมาย
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs text-rose-600 border-rose-300 hover:bg-rose-50 rounded-full h-8 px-3"
                          >
                            {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                          </Button>
                        </>
                      )}

                      {booking.status === 'completed' && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#7a5646]/40 text-[#7a5646] hover:bg-[#7a5646]/10 rounded-full h-8"
                        >
                          <Link to={`/home/services?book=${booking.service_id}`}>
                            จองซ้ำ
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">เลื่อนเวลานัดหมาย (Reschedule)</h3>
              <button onClick={() => setReschedulingBooking(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#f6f3f2] rounded-xl space-y-1">
                <p><strong>บริการ:</strong> {reschedulingBooking.service?.name}</p>
                <p><strong>เวลานัดเดิม:</strong> {reschedulingBooking.booking_date} เวลา {reschedulingBooking.booking_time} น.</p>
              </div>

              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1">เลือกวันที่ใหม่ *</label>
                <Input
                  type="date"
                  value={newDate}
                  min={todayStr}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1b1c1c] mb-1">เลือกรอบเวลาใหม่ *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTime(t)}
                      className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                        newTime === t
                          ? 'bg-[#7a5646] text-white border-[#7a5646]'
                          : 'bg-card border-[#d4c3bc] hover:bg-[#e8ded8]'
                      }`}
                    >
                      {t} น.
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingReschedule}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium"
                >
                  {isSubmittingReschedule ? 'กำลังบันทึก...' : `ยืนยันเลื่อนนัดเป็น ${newDate} เวลา ${newTime} น.`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
