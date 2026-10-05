import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { loginAsDemo, authenticateWithLine } from '@/features/auth/auth-service';
import { isLiffConfigured, isInLiffBrowser } from '@/lib/liff';
import { Button } from '@/components/ui/button';
import { Scissors, Sparkles, ShieldCheck, ArrowRight, Clock, Star } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loadingRole, setLoadingRole] = useState<'customer' | 'line' | null>(null);

  useEffect(() => {
    // If opened inside LINE LIFF or already logged in as customer, go directly to customer app
    if (isInLiffBrowser() || isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleStartBooking = async () => {
    setLoadingRole('customer');
    try {
      await loginAsDemo('customer');
      navigate('/home/services');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleLineLogin = async () => {
    setLoadingRole('line');
    try {
      await authenticateWithLine();
      navigate('/home');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-[#f5f0ea] text-[#1b1c1c] min-h-screen flex flex-col selection:bg-[#7a5646] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#f5f0ea]/90 backdrop-blur-md border-b border-[#d4c3bc]/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#7a5646] flex items-center justify-center text-[#fcf9f8] shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-widest text-[#1b1c1c]">KIKI</span>
              <span className="text-xs uppercase tracking-wider text-[#7a5646] block -mt-1 font-medium">Beauty Space</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/home')}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full px-5 shadow-sm text-xs font-semibold"
              >
                เข้าสู่หน้าบริการ
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleStartBooking}
                  disabled={loadingRole !== null}
                  className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full px-5 shadow-sm text-xs"
                >
                  {loadingRole === 'customer' ? 'กำลังโหลด...' : 'จองคิวบริการ'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 px-6 flex-1 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7a5646]/10 border border-[#7a5646]/20 text-[#7a5646] w-fit text-xs font-medium tracking-wide">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              ร้านซาลอนความงามระดับพรีเมียมใจกลางเมือง
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1b1c1c] leading-[1.15]">
              ยกระดับความงามของคุณ ด้วยบริการ <span className="text-[#7a5646] italic font-normal">ระดับพรีเมียม</span>
            </h1>

            <p className="text-base sm:text-lg text-[#636260] max-w-xl leading-relaxed">
              KIKI Beauty Space ให้บริการออกแบบทรงผม ทำสี ทรีทเมนต์บำรุงล้ำลึก ทำเล็บ และสปา ด้วยผลิตภัณฑ์ออร์แกนิกนำเข้า พร้อมระบบจองคิวผ่าน LINE สะดวก รวดเร็ว ไม่ต้องรอคิว
            </p>

            {/* CTA Action Box */}
            <div className="bg-[#fcf9f8] p-6 rounded-2xl border border-[#d4c3bc]/60 shadow-lg shadow-[#7a5646]/5 flex flex-col sm:flex-row gap-4 max-w-lg mt-2">
              <Button
                onClick={handleStartBooking}
                disabled={loadingRole !== null}
                className="flex-1 bg-[#7a5646] hover:bg-[#634335] text-white py-6 rounded-xl text-base font-medium shadow-md shadow-[#7a5646]/20"
              >
                {loadingRole === 'customer' ? 'กำลังเชื่อมต่อ...' : 'เริ่มต้นจองคิวบริการ'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/home')}
                className="border-[#7a5646]/40 text-[#7a5646] hover:bg-[#7a5646]/10 py-6 rounded-xl text-base font-medium px-6"
              >
                ดูบริการทั้งหมด
              </Button>
            </div>

            {isLiffConfigured && (
              <div className="mt-1">
                <Button
                  variant="ghost"
                  onClick={handleLineLogin}
                  disabled={loadingRole !== null}
                  className="text-xs text-[#06C755] hover:text-[#05b34c] hover:bg-emerald-50 px-0 flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#06C755]"></span>
                  เชื่อมต่อด้วยบัญชี LINE Official Account (LIFF)
                </Button>
              </div>
            )}

            {/* Quick Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#d4c3bc]/50 text-xs sm:text-sm text-[#636260]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7a5646]" />
                <span>ช่างผมมืออาชีพ</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7a5646]" />
                <span>จองคิวแม่นยำ</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#7a5646]" />
                <span>ผลิตภัณฑ์ระดับสากล</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#fcf9f8]">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80"
                alt="KIKI Luxury Beauty Salon"
                className="w-full h-[450px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">Signature Space</span>
                <h3 className="font-serif text-2xl font-bold">KIKI Salon & Wellness</h3>
                <p className="text-xs text-white/80 mt-1">สัมผัสประสบการณ์ความผ่อนคลายและการดูแลที่ประณีตในทุกรายละเอียด</p>
              </div>
            </div>

            {/* Floating Review Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#d4c3bc]/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                ★ 4.9
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1b1c1c]">คะแนนรีวิวจากลูกค้า</p>
                <p className="text-[11px] text-[#636260]">มากกว่า 1,200+ นัดหมายประทับใจ</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d4c3bc]/40 bg-[#ece6de] py-6 px-6 text-center text-xs text-[#636260]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} KIKI Beauty Space. สงวนลิขสิทธิ์ทุกประการ</p>
          <div className="flex gap-4">
            <span className="text-[#7a5646] font-medium">KIKI Beauty Space • Bangkok</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
