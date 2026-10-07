import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguageStore } from '@/stores/language-store';
import { salonService } from '@/services/salon-service';
import type { Service, BookingWithRelations, Branch } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Scissors, ChevronRight, Clock, Sparkles, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KikiLogo } from '@/components/common/kiki-logo';

export function Home() {
  const { user } = useAuthStore();
  const { t, language } = useLanguageStore();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<BookingWithRelations | null>(null);

  useEffect(() => {
    loadHomeData();
  }, [user?.id]);

  const loadHomeData = async () => {
    const [services, branchList] = await Promise.all([
      salonService.getServices(),
      salonService.getBranches(),
    ]);
    setFeaturedServices(services.slice(0, 4));
    setBranches(branchList.filter((b) => b.is_active));

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
            {t('heroBadge')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 tracking-wide leading-tight">
            {t('welcome')} <span className="text-amber-200">{user?.display_name || t('specialGuest')}</span>
          </h2>
          <p className="text-white/90 text-xs sm:text-sm mb-5 leading-relaxed font-light">
            {t('heroSubtitle')}
          </p>

          <Button asChild className="bg-[#f5f0ea] hover:bg-white text-[#1b1c1c] font-semibold rounded-full px-6 shadow-lg text-xs h-10">
            <Link to="/services">
              {t('bookNow')} <ChevronRight className="ml-1 w-4 h-4" />
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
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">{t('upcomingAppointmentBadge')}</span>
                  <Badge className="bg-amber-200 text-amber-900 border-0 text-[10px]">
                    {upcomingBooking.status === 'confirmed' ? t('statusConfirmed') : t('statusPending')}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-[#1b1c1c] mt-0.5">
                  {upcomingBooking.service?.name}
                </h4>
                <p className="text-xs text-[#636260] mt-0.5">
                  {language === 'th' ? 'วันที่ ' : 'Date: '}<strong>{upcomingBooking.booking_date}</strong> {language === 'th' ? 'เวลา ' : 'Time: '}<strong>{upcomingBooking.booking_time} {t('minsShort')}</strong>
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="border-amber-400 text-amber-900 hover:bg-amber-100 rounded-full text-xs">
              <Link to="/bookings">{t('viewBookingDetails')}</Link>
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
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#1b1c1c]">{t('ourServicesTitle')}</h3>
                <p className="text-[11px] sm:text-xs text-[#636260] mt-0.5">{t('ourServicesSub')}</p>
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
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#1b1c1c]">{t('myBookingsCardTitle')}</h3>
                <p className="text-[11px] sm:text-xs text-[#636260] mt-0.5">{t('myBookingsCardSub')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured Services Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1b1c1c]">{t('featuredServicesTitle')}</h3>
            <p className="text-xs text-[#636260]">{t('featuredServicesSub')}</p>
          </div>
          <Button variant="link" className="text-[#7a5646] p-0 h-auto text-xs sm:text-sm font-semibold" asChild>
            <Link to="/services">{t('viewAllServices')}</Link>
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
                      {service.duration_minutes} {t('minutes')}
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-3.5 h-8 flex-shrink-0 shadow-sm"
                >
                  <Link to={`/services?book=${service.id}`}>{t('bookShort')}</Link>
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
            <h4 className="font-serif font-bold text-base text-[#1b1c1c]">{t('onlineChannelsTitle')}</h4>
          </div>
          <KikiLogo className="w-7 h-7 text-[#1b1c1c]" />
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
      <Card className="bg-[#fcf9f8] border-[#d4c3bc]/60 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-[#d4c3bc]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#1b1c1c]">{t('branchesTitle')}</h4>
          </div>
          <span className="text-[11px] text-[#7a5646] font-medium bg-[#7a5646]/10 px-2.5 py-0.5 rounded-full">
            {branches.length} {language === 'th' ? 'สาขา' : 'Locations'}
          </span>
        </div>

        {/* Dynamic Branch List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-2xl bg-card border border-[#d4c3bc]/60 flex flex-col justify-between space-y-2.5 hover:border-[#7a5646]/50 transition-colors shadow-xs"
            >
              <div>
                <h5 className="font-semibold text-xs sm:text-sm text-[#1b1c1c] leading-tight">
                  {b.name}
                </h5>
                <p className="text-[11px] text-[#636260] mt-1 line-clamp-2 leading-relaxed">
                  {b.address}
                </p>
                {b.opening_hours && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#7a5646]" />
                    <span>{b.opening_hours}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#d4c3bc]/30 flex items-center justify-between text-xs">
                {b.phone ? (
                  <a
                    href={`tel:${b.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1 text-[#7a5646] font-semibold hover:underline text-[11px]"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{b.phone}</span>
                  </a>
                ) : (
                  <span />
                )}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-[11px] text-[#7a5646] hover:bg-[#7a5646]/10 p-1 h-auto font-medium"
                >
                  <Link to="/services">
                    {language === 'th' ? 'จองสาขานี้ →' : 'Book →'}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Hotline & LINE Official */}
        <div className="pt-2 border-t border-[#d4c3bc]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#636260]">
            <span className="font-medium text-[#1b1c1c]">{language === 'th' ? 'ฝ่ายบริการลูกค้า:' : 'Customer Care:'}</span>
            <a href="tel:0964415955" className="text-[#7a5646] font-semibold hover:underline">096-441-5955</a>
          </div>
          <a
            href="https://lin.ee/gLMafQm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#06C755] font-semibold hover:underline flex items-center gap-1"
          >
            <span>LINE Official: @kikibeautyspace</span>
          </a>
        </div>
      </Card>
    </div>
  );
}
