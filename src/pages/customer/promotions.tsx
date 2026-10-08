import { useState, useEffect } from 'react';
import { salonService } from '@/services/salon-service';
import type { Promotion, Service } from '@/types';
import { useLanguageStore } from '@/stores/language-store';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Scissors, 
  CheckCircle2, 
  Flame,
  Clock,
  ChevronRight
} from 'lucide-react';

export function PromotionsPage() {
  const { language } = useLanguageStore();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromotionsData();
  }, []);

  const loadPromotionsData = async () => {
    setIsLoading(true);
    try {
      const [promos, srvs] = await Promise.all([
        salonService.getPromotions(),
        salonService.getServices(),
      ]);
      setPromotions(promos.filter((p) => p.is_active));
      setServices(srvs);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 selection:bg-[#7a5646] selection:text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1b1c1c] text-white p-6 sm:p-8 shadow-xl border border-[#d4c3bc]/30">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#7a5646]/40 to-black/60" />
        <img
          src="https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-07-scaled-2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-300/30">
            <Flame className="w-3.5 h-3.5 fill-current" />
            {language === 'th' ? 'โปรโมชั่นพิเศษประจำเดือน' : 'Monthly Highlights & Special Deals'}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
            {language === 'th' ? 'ดีลสุดเอ็กซ์คลูซีฟ ประจำเดือนตุลาคม' : 'October Exclusive Offers'}
          </h1>
          <p className="text-xs sm:text-sm text-[#f5f0ea]/80 mt-2 leading-relaxed">
            {language === 'th'
              ? 'ปรนนิบัติความงามระดับลักชัวรีในราคาพิเศษ คัดสรรเฉพาะบริการยอดนิยมสำหรับคุณที่ KIKI Beauty Space'
              : 'Indulge in bespoke luxury beauty at privileged prices. Curated packages and limited-time privileges.'}
          </p>
        </div>
      </div>

      {/* Promotions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-card animate-pulse border border-[#d4c3bc]/50" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 bg-[#fcf9f8] rounded-3xl border border-dashed border-[#d4c3bc] p-8 space-y-3">
          <Sparkles className="w-12 h-12 text-[#7a5646]/40 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
            {language === 'th' ? 'กำลังเตรียมโปรโมชั่นใหม่' : 'New promotions are coming soon'}
          </h3>
          <p className="text-xs text-[#636260]">
            {language === 'th'
              ? 'โปรดติดตามข้อเสนอสุดพิเศษจาก KIKI Beauty Space ได้เร็วๆ นี้'
              : 'Stay tuned for next month exclusive beauty privileges.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {promotions.map((promo) => {
            const matchedServices = services.filter((s) => promo.service_ids?.includes(s.id));
            const primaryServiceId = promo.service_ids?.[0];

            return (
              <Card
                key={promo.id}
                className="overflow-hidden border-[#d4c3bc]/70 bg-[#fcf9f8] rounded-3xl hover:shadow-lg transition-all border group"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  {/* Promo Image */}
                  <div className="md:col-span-5 relative min-h-[200px] md:min-h-full overflow-hidden">
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                    {promo.badge && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#7a5646] text-white border-0 text-xs px-2.5 py-0.5 shadow-md font-medium">
                          {promo.badge}
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 md:hidden">
                      <span className="font-serif font-bold text-lg text-amber-200 drop-shadow">
                        {promo.discount_text}
                      </span>
                    </div>
                  </div>

                  {/* Promo Content */}
                  <CardContent className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      <div className="hidden md:flex items-center justify-between gap-2 mb-2">
                        {promo.badge ? (
                          <Badge className="bg-[#7a5646] text-white border-0 text-xs px-2.5 py-0.5">
                            {promo.badge}
                          </Badge>
                        ) : <div />}
                        <span className="font-serif font-bold text-base text-[#7a5646]">
                          {promo.discount_text}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1b1c1c] leading-snug">
                        {promo.title}
                      </h3>

                      <p className="text-xs text-[#636260] mt-2 leading-relaxed">
                        {promo.description}
                      </p>

                      {/* Related Services */}
                      {matchedServices.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-[#d4c3bc]/40 space-y-1.5">
                          <span className="text-[10px] uppercase font-semibold text-[#7a5646] tracking-wider block">
                            {language === 'th' ? 'บริการที่ร่วมรายการ:' : 'Applicable Services:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {matchedServices.map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f6f3f2] border border-[#d4c3bc]/50 text-[11px] text-[#1b1c1c]"
                              >
                                <Scissors className="w-3 h-3 text-[#7a5646]" />
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Terms */}
                      {promo.terms && promo.terms.length > 0 && (
                        <div className="mt-3 text-[11px] text-[#8a8885] space-y-0.5">
                          {promo.terms.map((term, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{term}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA & Validity */}
                    <div className="mt-5 pt-3.5 border-t border-[#d4c3bc]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#636260]">
                        <Clock className="w-3.5 h-3.5 text-[#7a5646]" />
                        <span>{language === 'th' ? 'ใช้ได้ถึง:' : 'Valid until:'} <strong>{promo.valid_until}</strong></span>
                      </div>

                      <Button
                        asChild
                        className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs font-semibold px-5 h-10 shadow-md shadow-[#7a5646]/20"
                      >
                        <Link to={primaryServiceId ? `/services?book=${primaryServiceId}` : '/services'}>
                          {language === 'th' ? 'จองแพ็กเกจนี้ทันที' : 'Book This Offer'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
