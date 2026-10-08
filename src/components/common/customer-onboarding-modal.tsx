import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { salonService } from '@/services/salon-service';
import type { CustomerType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KikiLogo } from '@/components/common/kiki-logo';
import { Sparkles, Heart, UserPlus, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

interface CustomerOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function CustomerOnboardingModal({ isOpen, onComplete }: CustomerOnboardingModalProps) {
  const { user, setUser } = useAuthStore();
  const [selectedType, setSelectedType] = useState<CustomerType>('new');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedProfile = {
        ...user,
        phone: phone.trim() || user.phone,
        customer_type: selectedType,
      };

      // Save to store
      setUser(updatedProfile);

      // Save to backend/localStorage
      await salonService.updateCustomerProfile(user.id, {
        phone: phone.trim() || user.phone,
        customer_type: selectedType,
      });

      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#7a5646] selection:text-white animate-in fade-in duration-300">
      <div className="bg-[#fcf9f8] w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#d4c3bc] relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7a5646] via-[#d4a373] to-[#7a5646]" />

        {/* Brand Header */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#7a5646]/10 text-[#7a5646] mb-3 ring-4 ring-[#ffdbcc]/40">
            <KikiLogo className="w-9 h-9" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcc]/50 text-[#7a5646] text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-[#7a5646]" />
            ยินดีต้อนรับสู่ KIKI BEAUTY SPACE
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1b1c1c]">
            สวัสดีคุณ {user.display_name} ✨
          </h2>
          <p className="text-xs text-[#636260] mt-1 leading-relaxed">
            เพื่อมอบประสบการณ์และการดูแลที่เหมาะสมเฉพาะคุณมากที่สุด โปรดระบุสถานะการเข้ารับบริการ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Choice: New Customer vs Existing Customer */}
          <div className="grid grid-cols-2 gap-3">
            {/* New Customer */}
            <div
              onClick={() => setSelectedType('new')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center relative ${
                selectedType === 'new'
                  ? 'border-[#7a5646] bg-[#7a5646] text-white shadow-md'
                  : 'border-[#d4c3bc]/70 bg-card hover:border-[#7a5646]/50 text-[#1b1c1c]'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                  selectedType === 'new' ? 'bg-white/20 text-white' : 'bg-[#7a5646]/10 text-[#7a5646]'
                }`}
              >
                <UserPlus className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm">ลูกค้าใหม่</h4>
              <p
                className={`text-[10px] mt-1 leading-tight ${
                  selectedType === 'new' ? 'text-amber-100' : 'text-[#636260]'
                }`}
              >
                ครั้งแรกที่ KIKI Beauty Space (รับสิทธิ์โปรโมชั่นต้อนรับ)
              </p>
            </div>

            {/* Existing Customer */}
            <div
              onClick={() => setSelectedType('existing')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center relative ${
                selectedType === 'existing'
                  ? 'border-[#7a5646] bg-[#7a5646] text-white shadow-md'
                  : 'border-[#d4c3bc]/70 bg-card hover:border-[#7a5646]/50 text-[#1b1c1c]'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                  selectedType === 'existing' ? 'bg-white/20 text-white' : 'bg-[#7a5646]/10 text-[#7a5646]'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h4 className="font-serif font-bold text-sm">ลูกค้าปัจจุบัน</h4>
              <p
                className={`text-[10px] mt-1 leading-tight ${
                  selectedType === 'existing' ? 'text-amber-100' : 'text-[#636260]'
                }`}
              >
                เคยใช้บริการที่ร้านแล้ว (สะสมสิทธิประโยชน์ต่อเนื่อง)
              </p>
            </div>
          </div>

          {/* Contact Phone */}
          <div className="bg-[#f6f3f2] p-3.5 rounded-2xl border border-[#d4c3bc]/60">
            <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
              เบอร์โทรศัพท์สำหรับติดต่อยืนยันคิว (Phone Number) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="pl-9 bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                required
              />
            </div>
            <p className="text-[10px] text-[#636260] mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยเพื่อใช้ในการยืนยันคิวเท่านั้น
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSaving || !phone.trim()}
            className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium text-xs shadow-lg shadow-[#7a5646]/20 flex items-center justify-center gap-1.5 transition-all"
          >
            {isSaving ? 'กำลังบันทึกข้อมูล...' : 'เข้าสู่ KIKI Beauty Space'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
