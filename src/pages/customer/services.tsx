import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import { useAuthStore } from '@/stores/auth-store';
import { loginAsDemo, authenticateWithLine } from '@/features/auth/auth-service';
import { sendBookingChatMessage } from '@/lib/liff';
import { uploadSlip } from '@/lib/slip-upload';
import type { Service, ServiceCategory, Branch, Stylist } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar as CalendarIcon, 
  User, 
  Users, 
  Star, 
  QrCode, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Check 
} from 'lucide-react';

const CATEGORIES: { key: ServiceCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'ทั้งหมด', icon: '✨' },
  { key: 'hair', label: 'ทำผม & ทรีทเมนต์', icon: '💇‍♀️' },
  { key: 'nails', label: 'ทำเล็บ & สปา', icon: '💅' },
  { key: 'spa', label: 'สปา & ผ่อนคลาย', icon: '🌿' },
  { key: 'makeup', label: 'แต่งหน้า', icon: '💄' },
  { key: 'skincare', label: 'บำรุงผิวหน้า', icon: '🧖‍♀️' },
];

const MORNING_SLOTS = ['09:30', '10:30', '11:30'];
const AFTERNOON_SLOTS = ['13:00', '14:30', '16:00', '17:30', '18:30', '19:30'];

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  // Wizard Step: 1 = Branch & Services (Multipicklist), 2 = Date & Stylist, 3 = Summary & Deposit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Data Sources
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Step 1: Branch & Service Multipicklist Selection
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Step 2: Date, Time & Stylist Selection
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('13:00');
  const [selectedStylistId, setSelectedStylistId] = useState<string>('any'); // 'any' or stylist.id

  // Step 3: Summary, Contact & Deposit Slip
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '081-234-5678');
  const [bookingNote, setBookingNote] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const slipUploaded = slipFile !== null;

  const handleSlipSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกิน 5MB');
      return;
    }
    if (slipPreview) URL.revokeObjectURL(slipPreview);
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [brData, stData, srvData] = await Promise.all([
        salonService.getBranches(),
        salonService.getStylists(),
        salonService.getServices(),
      ]);
      setBranches(brData);
      setStylists(stData);
      setServices(srvData);

      if (brData.length > 0) {
        setSelectedBranchId(brData[0].id);
      }

      // Check if a pre-selected service was passed in query
      const preselect = searchParams.get('book');
      if (preselect) {
        setSelectedServiceIds([preselect]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Service selection for Multipicklist
  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const depositRequired = selectedServices.some((s) => s.deposit_required);
  const depositAmount = selectedServices.reduce((max, s) => Math.max(max, s.deposit_amount), 0);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const availableStylists = stylists.filter((s) => s.branch_id === selectedBranchId && s.is_active);
  const selectedStylist = stylists.find((s) => s.id === selectedStylistId);

  // Submit Booking
  const handleConfirmBooking = async () => {
    let currentUser = user;
    if (!currentUser || currentUser.line_user_id?.startsWith('demo_')) {
      const lineUser = await authenticateWithLine();
      if (lineUser) {
        currentUser = lineUser;
      } else if (!currentUser) {
        currentUser = await loginAsDemo('customer');
      }
    }
    if (!currentUser || selectedServiceIds.length === 0) return;

    if (depositRequired && !slipFile) {
      alert('กรุณาแนบสลิปโอนเงินมัดจำก่อนยืนยันการจอง');
      return;
    }

    setIsSubmitting(true);
    try {
      let slipUrl: string | null = null;
      if (depositRequired && slipFile) {
        try {
          slipUrl = await uploadSlip(slipFile, currentUser.id);
        } catch (uploadErr) {
          console.error('Slip upload failed:', uploadErr);
          alert('อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
          return;
        }
      }

      await salonService.createBooking({
        customerId: currentUser.id,
        customerProfile: { ...currentUser, phone: customerPhone },
        branchId: selectedBranchId,
        serviceIds: selectedServiceIds,
        stylistId: selectedStylistId,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        depositAmount: depositRequired ? depositAmount : 0,
        depositStatus: depositRequired ? 'pending_verification' : 'none',
        slipUrl,
        note: bookingNote ? `${bookingNote} (โทร: ${customerPhone})` : `(โทร: ${customerPhone})`,
      });

      // Send confirmation to LINE chat
      await sendBookingChatMessage(
        selectedServices.map((s) => s.name).join(' + '),
        selectedDate,
        selectedTime,
        totalPrice
      );

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกการจองคิว');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (!s.is_active) return false;
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-3xl mx-auto pb-28 pt-2">
      {/* Stepper Indicator */}
      <div className="mb-6 px-2">
        <div className="flex items-center justify-between text-xs font-medium text-[#636260] mb-2">
          <span className={currentStep >= 1 ? 'text-[#7a5646] font-bold' : ''}>1. เลือกสาขา & บริการ</span>
          <span className={currentStep >= 2 ? 'text-[#7a5646] font-bold' : ''}>2. วัน เวลา & ช่าง</span>
          <span className={currentStep >= 3 ? 'text-[#7a5646] font-bold' : ''}>3. สรุปยอด & มัดจำ</span>
        </div>
        <div className="w-full flex items-center gap-1.5 h-1.5 bg-[#e4e2e1] rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-300 rounded-full ${currentStep >= 1 ? 'bg-[#7a5646] w-1/3' : 'w-0'}`} />
          <div className={`h-full transition-all duration-300 rounded-full ${currentStep >= 2 ? 'bg-[#7a5646] w-1/3' : 'w-0'}`} />
          <div className={`h-full transition-all duration-300 rounded-full ${currentStep >= 3 ? 'bg-[#7a5646] w-1/3' : 'w-0'}`} />
        </div>
      </div>

      {/* ================= STEP 1: BRANCH & SERVICES MULTIPICKLIST ================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Branch Selection Box */}
          <div className="bg-[#fcf9f8] p-4 sm:p-5 rounded-2xl border border-[#d4c3bc]/60 shadow-sm">
            <label className="block font-serif text-lg font-bold text-[#1b1c1c] mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#7a5646]" />
              เลือกสาขาที่ต้องการเข้ารับบริการ
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full bg-[#f6f3f2] border border-[#d4c3bc] rounded-xl py-3.5 px-4 text-[#1b1c1c] font-medium text-sm outline-none focus:border-[#7a5646] transition-colors"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.opening_hours})
                </option>
              ))}
            </select>
            {selectedBranch && (
              <p className="text-xs text-[#636260] mt-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7a5646] flex-shrink-0" />
                <span>{selectedBranch.address}</span>
              </p>
            )}
          </div>

          {/* Search & Categories */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อบริการ..."
                  className="pl-9 bg-[#fcf9f8] border-[#d4c3bc]/70 rounded-full text-xs h-10"
                />
              </div>

              <div className="text-xs text-[#7a5646] font-medium self-center bg-[#7a5646]/10 px-3 py-1.5 rounded-full">
                💡 ติ๊กเลือกได้หลายบริการในคิวเดียว (Multipicklist)
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#7a5646] text-white shadow-sm'
                        : 'bg-[#fcf9f8] text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Cards Multipicklist */}
          <div className="grid grid-cols-1 gap-3.5">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-28 rounded-2xl bg-card animate-pulse border border-[#d4c3bc]/40" />
              ))
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-[#fcf9f8] rounded-2xl border border-dashed border-[#d4c3bc] p-6 text-sm text-[#636260]">
                ไม่พบบริการที่ค้นหา
              </div>
            ) : (
              filteredServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => handleToggleService(service.id)}
                    className={`flex items-center p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#ffdbcc]/20 border-[#7a5646] shadow-md ring-1 ring-[#7a5646]'
                        : 'bg-[#fcf9f8] border-[#d4c3bc]/60 hover:border-[#7a5646]/50 shadow-sm'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3.5 transition-all flex-shrink-0 ${
                      isSelected ? 'bg-[#7a5646] text-white' : 'border-2 border-[#d4c3bc] bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Image */}
                    <img
                      src={service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300'}
                      alt={service.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 mr-3.5"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge variant="outline" className="text-[10px] text-[#7a5646] border-[#7a5646]/40 uppercase px-1.5 py-0">
                          {service.category}
                        </Badge>
                        {service.deposit_required && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-medium">
                            มัดจำ ฿{service.deposit_amount}
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-sm sm:text-base text-[#1b1c1c] leading-snug truncate">
                        {service.name}
                      </h4>
                      <p className="text-xs text-[#636260] line-clamp-1 mt-0.5">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-serif font-bold text-[#7a5646] text-base">
                          ฿{service.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration_minutes} นาที
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= STEP 2: DATE, TIME & STYLIST SELECTION ================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Stylist Selector */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#1b1c1c] mb-1">
              เลือกช่างประจำการจอง (Select Stylist)
            </h3>
            <p className="text-xs text-[#636260] mb-4">
              เลือกช่างที่ต้องการ หรือเลือก "ช่างคนไหนก็ได้" เพื่อรอบเวลาที่รวดเร็วที่สุด
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Option: Any Stylist */}
              <div
                onClick={() => setSelectedStylistId('any')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  selectedStylistId === 'any'
                    ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-md'
                    : 'bg-card border-[#d4c3bc]/60 hover:bg-[#e8ded8] text-[#1b1c1c]'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                  selectedStylistId === 'any' ? 'bg-white/20 text-white' : 'bg-[#7a5646]/10 text-[#7a5646]'
                }`}>
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-xs leading-tight">ช่างคนไหนก็ได้</h4>
                <p className={`text-[10px] mt-0.5 ${selectedStylistId === 'any' ? 'text-white/80' : 'text-muted-foreground'}`}>
                  First Available
                </p>
              </div>

              {/* Stylist Profiles */}
              {availableStylists.map((st) => {
                const isSelected = selectedStylistId === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStylistId(st.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-md ring-2 ring-[#7a5646]/30'
                        : 'bg-card border-[#d4c3bc]/60 hover:bg-[#e8ded8] text-[#1b1c1c]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-200" />
                      </div>
                    )}
                    <img
                      src={st.avatar_url}
                      alt={st.name}
                      className="w-14 h-14 rounded-full object-cover mb-2 border border-white/40 shadow-sm"
                    />
                    <h4 className="font-semibold text-xs leading-tight truncate w-full">{st.name}</h4>
                    <p className={`text-[10px] mt-0.5 truncate w-full ${isSelected ? 'text-amber-200' : 'text-[#7a5646]'}`}>
                      {st.title}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] mt-1 text-amber-500">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{st.rating} ({st.review_count})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#1b1c1c] mb-1">
              เลือกวันที่นัดหมาย (Select Date)
            </h3>
            <p className="text-xs text-[#636260] mb-3">เลือกรอบวันที่สะดวกเข้ามารับบริการ</p>
            <Input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-card border-[#d4c3bc] rounded-xl text-sm h-11"
            />
          </div>

          {/* Time Slots */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
              เลือกรอบเวลา (Select Time)
            </h3>

            <div>
              <p className="text-xs font-semibold text-[#636260] uppercase tracking-wider mb-2">ช่วงเช้า (Morning)</p>
              <div className="grid grid-cols-3 gap-2">
                {MORNING_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 text-xs rounded-xl font-medium border transition-all ${
                      selectedTime === slot
                        ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-sm'
                        : 'bg-card border-[#d4c3bc]/60 text-[#1b1c1c] hover:bg-[#e8ded8]'
                    }`}
                  >
                    {slot} น.
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#636260] uppercase tracking-wider mb-2">ช่วงบ่าย - เย็น (Afternoon)</p>
              <div className="grid grid-cols-3 gap-2">
                {AFTERNOON_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 text-xs rounded-xl font-medium border transition-all ${
                      selectedTime === slot
                        ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-sm'
                        : 'bg-card border-[#d4c3bc]/60 text-[#1b1c1c] hover:bg-[#e8ded8]'
                    }`}
                  >
                    {slot} น.
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: BOOKING SUMMARY & DEPOSIT ================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Details Card */}
          <Card className="bg-[#fcf9f8] border-[#d4c3bc]/60 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1b1c1c] border-b border-[#d4c3bc]/50 pb-3">
              สรุปข้อมูลการจอง (Booking Summary)
            </h3>

            {/* Branch & Stylist Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">สาขา</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedBranch?.name}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <User className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">ช่างผู้ให้บริการ</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedStylist?.name || 'ช่างคนไหนก็ได้ (First Available)'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">วัน-เวลานัดหมาย</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedDate} เวลา {selectedTime} น.</span>
                </div>
              </div>

              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">ระยะเวลารวม</span>
                  <span className="font-bold text-[#1b1c1c]">{totalDuration} นาที</span>
                </div>
              </div>
            </div>

            {/* Selected Services List */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#636260] mb-2">รายการบริการที่เลือก ({selectedServices.length}):</p>
              <div className="space-y-2">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between items-center text-xs py-1.5 border-b border-[#d4c3bc]/30">
                    <span className="text-[#1b1c1c]">{s.name} ({s.duration_minutes} นาที)</span>
                    <span className="font-serif font-bold text-[#7a5646]">฿{s.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-[#f6f3f2] rounded-2xl border border-[#d4c3bc]/60 space-y-2 text-xs">
              <div className="flex justify-between text-[#636260]">
                <span>ยอดรวมค่าบริการ</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              {depositRequired && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span>ยอดเงินมัดจำ (ชำระตอนนี้)</span>
                  <span>฿{depositAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-serif font-bold text-[#1b1c1c] pt-2 border-t border-[#d4c3bc]/40">
                <span>ยอดชำระที่ร้านหลังหักมัดจำ</span>
                <span className="text-[#7a5646]">฿{(totalPrice - (depositRequired ? depositAmount : 0)).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Deposit PromptPay Section (If Deposit Required) */}
          {depositRequired && (
            <Card className="bg-[#fcf9f8] border-amber-300 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-amber-900">
                  ชำระเงินมัดจำล่วงหน้า (฿{depositAmount.toLocaleString()})
                </h3>
              </div>
              <p className="text-xs text-[#636260]">
                บริการที่เลือกต้องวางเงินมัดจำเพื่อยืนยันคิวช่าง กรุณาสแกน QR Code พร้อมเพย์ และแนบสลิปด้านล่าง
              </p>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl border border-[#d4c3bc] max-w-xs mx-auto text-center space-y-2">
                <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center p-2 border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=promptpay://0812345678?amount=${depositAmount}`}
                    alt="PromptPay QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-[#1b1c1c]">PromptPay: 081-234-5678</p>
                <p className="text-[11px] text-muted-foreground">KIKI Beauty Space Co., Ltd.</p>
              </div>

              {/* Upload Slip */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#1b1c1c] mb-1.5">หลักฐานการโอนเงิน (สลิป):</label>
                <label
                  htmlFor="slip-file-input"
                  className={`block p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                    slipUploaded
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-card border-[#d4c3bc] hover:border-[#7a5646] text-[#636260]'
                  }`}
                >
                  <input
                    id="slip-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSlipSelected}
                  />
                  {slipPreview ? (
                    <img src={slipPreview} alt="สลิปโอนเงิน" className="max-h-48 mx-auto rounded-xl mb-2 object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                  )}
                  {slipUploaded ? (
                    <span className="text-xs font-semibold flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> เลือกสลิปแล้ว (คลิกเพื่อเปลี่ยน)
                    </span>
                  ) : (
                    <span className="text-xs">คลิกเพื่ออัปโหลดรูปภาพสลิปโอนเงิน</span>
                  )}
                </label>
              </div>
            </Card>
          )}

          {/* Customer Phone & Note */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">เบอร์โทรศัพท์ติดต่อสำหรับยืนยันคิว *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-9 bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">หมายเหตุเพิ่มเติม</label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="เช่น ระบุเรฟเฟอเรนซ์สีผม, มีอาการแพ้สารเคมี"
                  className="pl-9 bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STICKY BOTTOM ACTION BAR ================= */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 w-full bg-[#fcf9f8]/95 backdrop-blur-xl border-t border-[#d4c3bc]/50 p-4 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#636260]">
              {selectedServiceIds.length} บริการ • {totalDuration} นาที
            </span>
            <span className="font-serif text-xl font-bold text-[#7a5646]">
              ฿{totalPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="border-[#d4c3bc] text-[#636260] rounded-full text-xs px-4 h-11"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> ย้อนกลับ
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                disabled={selectedServiceIds.length === 0}
                onClick={() => setCurrentStep(2)}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs sm:text-sm px-6 h-11 shadow-md shadow-[#7a5646]/20 font-medium"
              >
                ถัดไป: เลือกวัน & ช่าง
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs sm:text-sm px-6 h-11 shadow-md shadow-[#7a5646]/20 font-medium"
              >
                ถัดไป: สรุปข้อมูล & มัดจำ
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs sm:text-sm px-6 h-11 shadow-md shadow-[#7a5646]/20 font-medium"
              >
                {isSubmitting ? 'กำลังส่งข้อมูลการจอง...' : 'ยืนยันการจองคิว'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ================= SUCCESS CONFIRMATION MODAL ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border border-[#d4c3bc] space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-[#ffdbcc] text-[#7a5646] mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(255,219,204,0.9)] animate-pulse">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1b1c1c]">จองคิวสำเร็จ!</h3>
              <p className="text-xs text-[#636260] mt-1.5 leading-relaxed">
                การนัดหมายของคุณกับ {selectedStylist?.name || 'ช่างมืออาชีพ'} ที่ {selectedBranch?.name} ได้รับการบันทึกแล้ว
              </p>
            </div>

            <div className="p-3 bg-[#f6f3f2] rounded-xl text-xs space-y-1 text-left border border-[#d4c3bc]/50">
              <p><strong>วันที่:</strong> {selectedDate}</p>
              <p><strong>เวลา:</strong> {selectedTime} น. ({totalDuration} นาที)</p>
              <p><strong>ยอดเงินรวม:</strong> ฿{totalPrice.toLocaleString()}</p>
              {depositRequired && (
                <p><strong>สถานะมัดจำ:</strong> <span className="text-amber-800 font-medium">รอการตรวจสอบสลิป</span></p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/bookings');
                }}
                className="w-full bg-[#7a5646] hover:bg-[#634335] text-white rounded-xl py-5 text-xs font-semibold"
              >
                ดูการจองของฉัน
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="w-full text-xs text-[#636260]"
              >
                กลับสู่หน้าหลัก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
