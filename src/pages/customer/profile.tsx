import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguageStore } from '@/stores/language-store';
import { salonService } from '@/services/salon-service';
import type { CustomerType, BookingWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Calendar, 
  Heart, 
  UserPlus, 
  CheckCircle2, 
  LogOut,
  ChevronRight,
  Save
} from 'lucide-react';

export function CustomerProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { language } = useLanguageStore();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [customerType, setCustomerType] = useState<CustomerType>(user?.customer_type || 'new');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [myBookings, setMyBookings] = useState<BookingWithRelations[]>([]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setPhone(user.phone || '');
      setCustomerType(user.customer_type || 'new');
      setBirthday(user.birthday || '');

      salonService.getBookings({ customerId: user.id })
        .then((data) => setMyBookings(data));
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="text-center py-16 bg-[#fcf9f8] rounded-3xl border border-[#d4c3bc] p-8 max-w-md mx-auto">
        <User className="w-12 h-12 text-[#7a5646]/50 mx-auto mb-3" />
        <h2 className="font-serif text-xl font-bold text-[#1b1c1c]">โปรดเข้าสู่ระบบ</h2>
        <p className="text-xs text-[#636260] mt-1 mb-4">เข้าสู่ระบบผ่าน LINE เพื่อดูข้อมูลโปรไฟล์ของคุณ</p>
        <Button asChild className="bg-[#06C755] hover:bg-[#05b34c] text-white rounded-full text-xs">
          <Link to="/">กลับสู่หน้าแรก</Link>
        </Button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const updated = {
        ...user,
        display_name: displayName.trim() || user.display_name,
        phone: phone.trim() || null,
        customer_type: customerType,
        birthday: birthday || null,
      };

      setUser(updated);
      await salonService.updateCustomerProfile(user.id, {
        display_name: displayName.trim() || user.display_name,
        phone: phone.trim() || null,
        customer_type: customerType,
        birthday: birthday || null,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = myBookings.filter((b) => b.status === 'completed').length;
  const upcomingCount = myBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 selection:bg-[#7a5646] selection:text-white">
      {/* Profile Header Card */}
      <Card className="bg-[#fcf9f8] border-[#d4c3bc]/70 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#7a5646] via-[#946955] to-[#7a5646] relative" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-3.5">
              {user.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={user.display_name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#fcf9f8] shadow-md bg-white shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#7a5646]/20 text-[#7a5646] flex items-center justify-center font-bold text-2xl ring-4 ring-[#fcf9f8] shadow-md bg-white shrink-0">
                  {user.display_name?.[0] || 'U'}
                </div>
              )}
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl font-bold text-[#1b1c1c]">{user.display_name}</h1>
                  <Badge className="bg-[#7a5646] text-white text-[10px] py-0 px-2 border-0">
                    {user.customer_type === 'existing'
                      ? (language === 'th' ? 'ลูกค้าประจำ (VIP)' : 'Regular Guest')
                      : (language === 'th' ? 'ลูกค้าใหม่ (New)' : 'New Guest')}
                  </Badge>
                </div>
                <p className="text-xs text-[#636260] mt-0.5">LINE User ID: {user.line_user_id?.slice(0, 16)}...</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-[#d4c3bc] text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs rounded-full h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              {language === 'th' ? 'ออกจากระบบ' : 'Log Out'}
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#d4c3bc]/40 text-center">
            <div className="bg-[#f6f3f2] p-3 rounded-2xl">
              <span className="text-[10px] text-[#636260] uppercase block tracking-wider">
                {language === 'th' ? 'นัดหมายที่รอดำเนินการ' : 'Upcoming Bookings'}
              </span>
              <span className="font-serif font-bold text-lg text-[#7a5646]">{upcomingCount}</span>
            </div>
            <div className="bg-[#f6f3f2] p-3 rounded-2xl">
              <span className="text-[10px] text-[#636260] uppercase block tracking-wider">
                {language === 'th' ? 'บริการที่เสร็จสมบูรณ์' : 'Completed Visits'}
              </span>
              <span className="font-serif font-bold text-lg text-[#7a5646]">{completedCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Information Form */}
      <Card className="bg-[#fcf9f8] border-[#d4c3bc]/70 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d4c3bc]/40">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
              {language === 'th' ? 'ข้อมูลส่วนตัว & การติดต่อ' : 'Personal & Contact Details'}
            </h3>
            <p className="text-xs text-[#636260] mt-0.5">
              {language === 'th' ? 'อัปเดตข้อมูลของคุณสำหรับติดต่อยืนยันคิวรับบริการ' : 'Keep your details up to date for booking confirmations'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {/* Customer Type Radio Selection */}
          <div>
            <label className="block font-semibold text-[#1b1c1c] mb-1.5">
              {language === 'th' ? 'สถานะลูกค้า' : 'Guest Status'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setCustomerType('new')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  customerType === 'new'
                    ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-sm'
                    : 'bg-[#f6f3f2] border-[#d4c3bc]/60 text-[#1b1c1c]'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold block text-xs">{language === 'th' ? 'ลูกค้าใหม่' : 'New Guest'}</span>
                  <span className={`text-[10px] ${customerType === 'new' ? 'text-amber-100' : 'text-[#636260]'}`}>
                    {language === 'th' ? 'เพิ่งเคยรับบริการครั้งแรก' : 'First-time at KIKI'}
                  </span>
                </div>
              </div>

              <div
                onClick={() => setCustomerType('existing')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  customerType === 'existing'
                    ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-sm'
                    : 'bg-[#f6f3f2] border-[#d4c3bc]/60 text-[#1b1c1c]'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0 fill-current" />
                <div>
                  <span className="font-bold block text-xs">{language === 'th' ? 'ลูกค้าปัจจุบัน' : 'Existing Guest'}</span>
                  <span className={`text-[10px] ${customerType === 'existing' ? 'text-amber-100' : 'text-[#636260]'}`}>
                    {language === 'th' ? 'เคยใช้บริการที่ร้านแล้ว' : 'Returning client'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block font-semibold text-[#1b1c1c] mb-1">
              {language === 'th' ? 'ชื่อที่แสดง (Display Name)' : 'Display Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="pl-9 bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                required
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block font-semibold text-[#1b1c1c] mb-1">
              {language === 'th' ? 'เบอร์โทรศัพท์ (Phone Number) *' : 'Phone Number *'}
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
          </div>

          {/* Birthday (Optional for Birthday Privileges) */}
          <div>
            <label className="block font-semibold text-[#1b1c1c] mb-1">
              {language === 'th' ? 'วันเกิด (เพื่อรับสิทธิพิเศษเดือนเกิด)' : 'Birthday (for birthday treats)'}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="pl-9 bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{language === 'th' ? 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' : 'Profile updated successfully'}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium text-xs shadow-md shadow-[#7a5646]/20 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isSaving
              ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...')
              : (language === 'th' ? 'บันทึกการเปลี่ยนแปลง' : 'Save Changes')}
          </Button>
        </form>
      </Card>

      {/* Navigation Shortcut to My Bookings */}
      <Link to="/bookings">
        <Card className="bg-[#fcf9f8] border-[#d4c3bc]/70 rounded-2xl p-4 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#1b1c1c]">
                {language === 'th' ? 'ดูประวัติและจัดการนัดหมายทั้งหมด' : 'View & Manage All Bookings'}
              </h4>
              <p className="text-[11px] text-[#636260]">
                {language === 'th' ? 'ตรวจสอบคิว เลื่อนวันนัด หรือดูสลิปมัดจำ' : 'Check queue status and appointment history'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#7a5646] group-hover:translate-x-1 transition-transform" />
        </Card>
      </Link>
    </div>
  );
}
