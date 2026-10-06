import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { salonService } from '@/services/salon-service';
import type { Service, BookingWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Scissors, ChevronRight, Clock, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const { user } = useAuthStore();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<BookingWithRelations | null>(null);

  useEffect(() => {
    loadHomeData();
  }, [user?.id]);

  const loadHomeData = async () => {
    const services = await salonService.getServices();
    setFeaturedServices(services.slice(0, 4));

    if (user) {
      const bookings = await salonService.getBookings({ customerId: user.id });
      const todayStr = new Date().toISOString().split('T')[0];
      const nextOne = bookings.find((b) => b.booking_date >= todayStr && (b.status === 'pending' || b.status === 'confirmed'));
      setUpcomingBooking(nextOne || null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      {/* Welcome & Brand Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl text-white shadow-2xl min-h-[220px] flex flex-col justify-end p-6 sm:p-8 border border-[#d4c3bc]/40">
        {/* Background Image */}
        <img
          src="https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-07-scaled-2.jpg"
          alt="KIKI Beauty Space Atmosphere"
          className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
        />
        {/* Luxury Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            No.1 Luxury Beauty Destination
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 tracking-wide leading-tight">
            ยินดีต้อนรับ, <span className="text-amber-200">{user?.display_name || 'ลูกค้าคนพิเศษ'}</span>
          </h2>
          <p className="text-white/90 text-xs sm:text-sm mb-5 leading-relaxed font-light">
            สัมผัสประสบการณ์ความงามระดับพรีเมียม ผสานไลฟ์สไตล์และแฟชั่น เพื่อการดูแลที่ตอบโจทย์เฉพาะคุณ
          </p>

          <Button asChild className="bg-[#f5f0ea] hover:bg-white text-[#1b1c1c] font-semibold rounded-full px-6 shadow-lg text-xs h-10">
            <Link to="/services">
              จองบริการทันที <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Upcoming Appointment Alert if any */}
      {upcomingBooking && (
        <Card className="border-amber-300/80 bg-amber-50/70 shadow-sm overflow-hidden rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200/70 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">นัดหมายถัดไปของคุณ</span>
                  <Badge className="bg-amber-200 text-amber-900 border-0 text-[10px]">
                    {upcomingBooking.status === 'confirmed' ? 'ยืนยันคิวแล้ว' : 'รอการยืนยัน'}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-[#1b1c1c] mt-0.5">
                  {upcomingBooking.service?.name}
                </h4>
                <p className="text-xs text-[#636260] mt-0.5">
                  วันที่ <strong>{upcomingBooking.booking_date}</strong> เวลา <strong>{upcomingBooking.booking_time} น.</strong>
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="border-amber-400 text-amber-900 hover:bg-amber-100 rounded-full text-xs">
              <Link to="/bookings">ดูรายละเอียดนัดหมาย</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        <Link to="/services" className="group">
          <Card className="hover:border-[#7a5646]/60 hover:shadow-md transition-all bg-card h-full border-[#d4c3bc]/60 rounded-2xl overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center p-5 sm:p-6 text-center gap-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#7a5646]/10 group-hover:bg-[#7a5646]/20 transition-colors flex items-center justify-center text-[#7a5646]">
                <Scissors className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#1b1c1c]">เมนูบริการของเรา</h3>
                <p className="text-[11px] sm:text-xs text-[#636260] mt-0.5">ตัดผม ทำสี เล็บ สปา ต่อขนตา</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/bookings" className="group">
          <Card className="hover:border-[#7a5646]/60 hover:shadow-md transition-all bg-card h-full border-[#d4c3bc]/60 rounded-2xl overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center p-5 sm:p-6 text-center gap-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#7a5646]/10 group-hover:bg-[#7a5646]/20 transition-colors flex items-center justify-center text-[#7a5646]">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#1b1c1c]">การจองของฉัน</h3>
                <p className="text-[11px] sm:text-xs text-[#636260] mt-0.5">ตรวจสอบสถานะ & เลื่อนนัดหมาย</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured Services Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1b1c1c]">บริการยอดนิยม (Signature Services)</h3>
            <p className="text-xs text-[#636260]">บริการระดับมาสเตอร์ที่ลูกค้าประทับใจมากที่สุด</p>
          </div>
          <Button variant="link" className="text-[#7a5646] p-0 h-auto text-xs sm:text-sm font-semibold" asChild>
            <Link to="/services">ดูทั้งหมด →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden bg-card border-[#d4c3bc]/60 hover:shadow-md transition-all rounded-2xl">
              <div className="flex p-3.5 sm:p-4 gap-3.5 items-center">
                <img
                  src={service.image_url || ''}
                  alt={service.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-[10px] text-[#7a5646] border-[#7a5646]/30 mb-1 uppercase font-semibold">
                    {service.category}
                  </Badge>
                  <h4 className="font-semibold text-xs sm:text-sm text-[#1b1c1c] truncate">{service.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#636260] mt-1">
                    <span className="font-serif font-bold text-[#7a5646]">฿{service.price.toLocaleString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {service.duration_minutes} น.
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-3.5 h-8 flex-shrink-0 shadow-sm"
                >
                  <Link to={`/services?book=${service.id}`}>จอง</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* KIKI Official Store & Channels */}
      <div className="bg-[#fcf9f8] p-5 sm:p-6 rounded-3xl border border-[#d4c3bc]/60 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7a5646] font-bold">KIKI Online Channels</span>
            <h4 className="font-serif font-bold text-base text-[#1b1c1c]">ร้านค้าออนไลน์ & ช่องทางติดตามทางการ</h4>
          </div>
          <img 
            src="https://kikibeautyspace.com/wp-content/themes/kiki/theme/assets/images/logo-icon.png" 
            alt="KIKI Icon" 
            className="w-6 h-6 object-contain"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <a
            href="https://page.line.me/338ismxn"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
          >
            <span>LINE Shopping</span>
          </a>
          <a
            href="https://www.lazada.co.th/tag/kiki-beauty-space/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200/60 font-medium flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-colors"
          >
            <span>LazMall Official</span>
          </a>
          <a
            href="https://shopee.co.th/kikibeautyspace"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-orange-50 text-orange-800 border border-orange-200/60 font-medium flex items-center justify-center gap-1.5 hover:bg-orange-100 transition-colors"
          >
            <span>Shopee Mall</span>
          </a>
          <a
            href="https://instagram.com/kikibeautyspace"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-pink-50 text-pink-800 border border-pink-200/60 font-medium flex items-center justify-center gap-1.5 hover:bg-pink-100 transition-colors"
          >
            <span>Instagram</span>
          </a>
        </div>
      </div>

      {/* Salon Locations & Direct Hotline Card */}
      <Card className="bg-[#fcf9f8] border-[#d4c3bc]/60 p-5 rounded-3xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#636260] space-y-1.5 flex-1">
            <h4 className="font-semibold text-sm text-[#1b1c1c]">KIKI Beauty Space Branches</h4>
            <p><strong>Flagship:</strong> สุขุมวิท 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ</p>
            <p><strong>Siam Lounge:</strong> ชั้น 2 สยามพารากอน | <strong>Bangna:</strong> เมกาบางนา</p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-[#7a5646] font-semibold">
              <a href="tel:0964415955" className="hover:underline">📞 096-441-5955</a>
              <span>•</span>
              <a href="tel:0917985955" className="hover:underline">📞 091-798-5955</a>
              <span>•</span>
              <a href="https://lin.ee/gLMafQm" target="_blank" rel="noopener noreferrer" className="hover:underline">LINE: @kikibeautyspace</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
