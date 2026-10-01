import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import { useAuthStore } from '@/stores/auth-store';
import { sendBookingChatMessage } from '@/lib/liff';
import type { Service, ServiceCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  Search, 
  CheckCircle2, 
  X,
  Phone,
  MessageSquare
} from 'lucide-react';

const CATEGORIES: { key: ServiceCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'ทั้งหมด', icon: '✨' },
  { key: 'hair', label: 'ทำผม & ทรีทเมนต์', icon: '💇‍♀️' },
  { key: 'nails', label: 'ทำเล็บ & สปามือเท้า', icon: '💅' },
  { key: 'spa', label: 'สปา & ผ่อนคลาย', icon: '🌿' },
  { key: 'makeup', label: 'แต่งหน้า', icon: '💄' },
  { key: 'skincare', label: 'บำรุงผิวหน้า', icon: '🧖‍♀️' },
];

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30'
];

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('13:30');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '081-234-5678');
  const [bookingNote, setBookingNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  // Check if a service was passed in query params
  useEffect(() => {
    const serviceId = searchParams.get('book');
    if (serviceId && services.length > 0) {
      const match = services.find((s) => s.id === serviceId);
      if (match) setSelectedService(match);
    }
  }, [searchParams, services]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await salonService.getServices(selectedCategory);
      setServices(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (!s.is_active) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
  });

  const handleOpenBooking = (service: Service) => {
    setSelectedService(service);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !user) return;

    setIsSubmitting(true);
    try {
      await salonService.createBooking({
        customerId: user.id,
        customerProfile: { ...user, phone: customerPhone },
        serviceId: selectedService.id,
        bookingDate,
        bookingTime,
        note: bookingNote ? `${bookingNote} (โทร: ${customerPhone})` : `(โทร: ${customerPhone})`,
      });

      // Send confirmation message to LINE chat if opened inside LINE Mini App
      await sendBookingChatMessage(selectedService.name, bookingDate, bookingTime, selectedService.price);

      setIsSuccessModal(true);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('เกิดข้อผิดพลาดในการจองคิว โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Date Helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterStr = dayAfterTomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">เมนูบริการ (Services)</h1>
          <p className="text-sm text-[#636260] mt-1">
            เลือกรับบริการระดับพรีเมียมจากช่างผู้เชี่ยวชาญ พร้อมระบบจองคิวล่วงหน้า
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อบริการ..."
            className="pl-9 bg-card border-[#d4c3bc]/70 rounded-full text-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#7a5646] text-white shadow-sm scale-105'
                  : 'bg-card text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-12">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-card/60 animate-pulse border border-[#d4c3bc]/40" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-[#d4c3bc] p-8">
          <Scissors className="w-12 h-12 mx-auto text-[#7a5646]/40 mb-3" />
          <p className="font-medium text-[#1b1c1c]">ไม่พบบริการที่ค้นหา</p>
          <p className="text-xs text-[#636260] mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="mt-4 rounded-full border-[#7a5646]/40 text-[#7a5646]"
          >
            แสดงบริการทั้งหมด
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden border-[#d4c3bc]/60 hover:shadow-lg transition-all duration-300 bg-card flex flex-col justify-between group"
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Service Image */}
                <div className="sm:w-44 h-48 sm:h-auto relative overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-0 text-[10px] font-normal uppercase tracking-wider">
                      {service.category}
                    </Badge>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-[#1b1c1c] leading-snug group-hover:text-[#7a5646] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#636260] mt-1.5 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#d4c3bc]/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#636260]">
                        <Clock className="w-3.5 h-3.5 text-[#7a5646]" />
                        <span>{service.duration_minutes} นาที</span>
                      </div>
                      <span className="font-serif text-lg font-bold text-[#7a5646]">
                        ฿{service.price.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleOpenBooking(service)}
                      className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full px-4 text-xs sm:text-sm font-medium shadow-sm"
                    >
                      จองบริการ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedService && !isSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-lg rounded-3xl shadow-2xl border border-[#d4c3bc] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#d4c3bc]/50 flex items-center justify-between bg-[#f5f0ea]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7a5646]" />
                <h2 className="font-serif text-lg font-bold text-[#1b1c1c]">จองคิวรับบริการ</h2>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
              {/* Selected Service Box */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f5f0ea] border border-[#d4c3bc]/60">
                <img
                  src={selectedService.image_url || ''}
                  alt={selectedService.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#1b1c1c] truncate">{selectedService.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#636260] mt-0.5">
                    <span>{selectedService.duration_minutes} นาที</span>
                    <span>•</span>
                    <span className="font-bold text-[#7a5646]">฿{selectedService.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#636260] mb-2">
                  1. เลือกวันที่รับบริการ
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setBookingDate(todayStr)}
                    className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                      bookingDate === todayStr
                        ? 'bg-[#7a5646] text-white border-[#7a5646] font-medium'
                        : 'bg-card border-[#d4c3bc]/60 text-[#636260] hover:bg-[#e8ded8]'
                    }`}
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingDate(tomorrowStr)}
                    className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                      bookingDate === tomorrowStr
                        ? 'bg-[#7a5646] text-white border-[#7a5646] font-medium'
                        : 'bg-card border-[#d4c3bc]/60 text-[#636260] hover:bg-[#e8ded8]'
                    }`}
                  >
                    พรุ่งนี้
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingDate(dayAfterStr)}
                    className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                      bookingDate === dayAfterStr
                        ? 'bg-[#7a5646] text-white border-[#7a5646] font-medium'
                        : 'bg-card border-[#d4c3bc]/60 text-[#636260] hover:bg-[#e8ded8]'
                    }`}
                  >
                    วันถัดไป
                  </button>
                </div>
                <Input
                  type="date"
                  value={bookingDate}
                  min={todayStr}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="bg-card border-[#d4c3bc]/60 rounded-xl text-sm"
                  required
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#636260] mb-2">
                  2. เลือกรอบเวลา
                </label>
                <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = bookingTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 text-xs rounded-xl border transition-all font-medium ${
                          isSelected
                            ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-sm'
                            : 'bg-card border-[#d4c3bc]/60 text-[#1b1c1c] hover:bg-[#e8ded8]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone & Note */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#636260] mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="pl-9 bg-card border-[#d4c3bc]/60 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#636260] mb-1">
                    หมายเหตุเพิ่มเติม (ถ้ามี)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      value={bookingNote}
                      onChange={(e) => setBookingNote(e.target.value)}
                      placeholder="เช่น ระบุช่างที่ต้องการ, ทรงผมที่ชอบ"
                      className="pl-9 bg-card border-[#d4c3bc]/60 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-6 rounded-2xl text-base font-medium shadow-md shadow-[#7a5646]/20"
                >
                  {isSubmitting ? 'กำลังส่งข้อมูลการจอง...' : `ยืนยันการจอง (${bookingDate} เวลา ${bookingTime})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-md rounded-3xl p-6 text-center shadow-2xl border border-[#d4c3bc] space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1b1c1c]">จองคิวสำเร็จ!</h3>
              <p className="text-sm text-[#636260] mt-1">
                การนัดหมายของคุณได้รับการบันทึกเรียบร้อยแล้ว แอดมินจะตรวจสอบและยืนยันคิวให้โดยเร็ว
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f0ea] text-left text-xs space-y-1.5 border border-[#d4c3bc]/60">
              <p><strong className="text-[#1b1c1c]">บริการ:</strong> {selectedService?.name}</p>
              <p><strong className="text-[#1b1c1c]">วันที่:</strong> {bookingDate}</p>
              <p><strong className="text-[#1b1c1c]">เวลา:</strong> {bookingTime} น.</p>
              <p><strong className="text-[#1b1c1c]">สถานะ:</strong> <span className="text-amber-700 font-medium">รอการยืนยัน (Pending)</span></p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => {
                  setIsSuccessModal(false);
                  setSelectedService(null);
                  navigate('/home/bookings');
                }}
                className="w-full bg-[#7a5646] hover:bg-[#634335] text-white rounded-xl py-5"
              >
                ดูการจองของฉัน
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSuccessModal(false);
                  setSelectedService(null);
                }}
                className="text-xs text-[#636260]"
              >
                เลือกบริการอื่นต่อ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
