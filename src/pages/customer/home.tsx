import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { salonService } from '@/services/salon-service';
import type { Service, BookingWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Scissors, ChevronRight, Star, Clock, Sparkles, MapPin } from 'lucide-react';
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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7a5646] to-[#4a342a] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles className="w-36 h-36 text-amber-200" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-amber-200 text-xs font-medium mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            KIKI Member Exclusive
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            ยินดีต้อนรับ, <span className="text-amber-200">{user?.display_name || 'ลูกค้าคนพิเศษ'}</span>
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mb-6 leading-relaxed">
            ให้เราดูแลความงามของคุณด้วยบริการระดับพรีเมียม สัมผัสความผ่อนคลายและการดูแลที่คัดสรรมาเพื่อคุณโดยเฉพาะ
          </p>

          <Button asChild className="bg-amber-100 hover:bg-white text-[#4a342a] font-semibold rounded-full px-6 shadow-md">
            <Link to="/services">
              จองบริการทันที <ChevronRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Upcoming Appointment Alert if any */}
      {upcomingBooking && (
        <Card className="border-amber-300/80 bg-amber-50/60 shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200/70 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
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
      <div className="grid grid-cols-2 gap-4">
        <Link to="/services" className="group">
          <Card className="hover:border-[#7a5646]/60 hover:shadow-md transition-all bg-card h-full border-[#d4c3bc]/60">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#7a5646]/10 group-hover:bg-[#7a5646]/20 transition-colors flex items-center justify-center text-[#7a5646]">
                <Scissors className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1b1c1c]">เมนูบริการของเรา</h3>
                <p className="text-xs text-[#636260] mt-1">ทำผม ทำเล็บ สปา แต่งหน้า</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/bookings" className="group">
          <Card className="hover:border-[#7a5646]/60 hover:shadow-md transition-all bg-card h-full border-[#d4c3bc]/60">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#7a5646]/10 group-hover:bg-[#7a5646]/20 transition-colors flex items-center justify-center text-[#7a5646]">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1b1c1c]">การจองของฉัน</h3>
                <p className="text-xs text-[#636260] mt-1">ดูสถานะ และประวัติคิวจอง</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured Services Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1b1c1c]">บริการยอดนิยม (Recommended)</h3>
            <p className="text-xs text-[#636260]">บริการที่ลูกค้าเลือกจองและประทับใจมากที่สุด</p>
          </div>
          <Button variant="link" className="text-[#7a5646] p-0 h-auto text-xs sm:text-sm font-semibold" asChild>
            <Link to="/services">ดูทั้งหมด →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden bg-card border-[#d4c3bc]/60 hover:shadow-md transition-all">
              <div className="flex p-4 gap-4 items-center">
                <img
                  src={service.image_url || ''}
                  alt={service.name}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-[10px] text-[#7a5646] border-[#7a5646]/30 mb-1 uppercase">
                    {service.category}
                  </Badge>
                  <h4 className="font-semibold text-sm text-[#1b1c1c] truncate">{service.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#636260] mt-1">
                    <span className="font-serif font-bold text-[#7a5646]">฿{service.price.toLocaleString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {service.duration_minutes} น.
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-3.5 h-8 flex-shrink-0"
                >
                  <Link to={`/services?book=${service.id}`}>จอง</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Salon Location & Contact Card */}
      <Card className="bg-[#fcf9f8] border-[#d4c3bc]/60 p-5 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#636260] space-y-1">
            <h4 className="font-semibold text-sm text-[#1b1c1c]">KIKI Beauty Space Bangkok</h4>
            <p>สุขุมวิท 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110</p>
            <p>เปิดให้บริการทุกวัน 10:00 - 20:00 น. | โทร: 02-123-4567</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
