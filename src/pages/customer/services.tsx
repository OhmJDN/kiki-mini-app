import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguageStore } from '@/stores/language-store';
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
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const THAI_FULL_DAY_NAMES = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
const THAI_FULL_MONTH_NAMES = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const ENGLISH_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ENGLISH_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEKDAY_SHORT_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalizedDateDisplay(dateStr: string, language: 'th' | 'en'): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (language === 'en') {
    const dayName = ENGLISH_DAY_NAMES[dateObj.getDay()];
    const monthName = ENGLISH_MONTH_NAMES[m - 1];
    return `${dayName}, ${monthName} ${d}, ${y}`;
  } else {
    const dayName = THAI_FULL_DAY_NAMES[dateObj.getDay()];
    const monthName = THAI_FULL_MONTH_NAMES[m - 1];
    const thaiYear = y + 543;
    return `${dayName}ที่ ${d} ${monthName} ${thaiYear}`;
  }
}

// Slots from 10:00 to 20:00 every 30 minutes
export const TIME_SLOTS_30MIN = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00'
];

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { t, language } = useLanguageStore();

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
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    return formatDateToYMD(new Date());
  });
  const [selectedTime, setSelectedTime] = useState<string>('13:00');
  const [selectedStylistId, setSelectedStylistId] = useState<string>('any'); // 'any' or stylist.id

  // Month Calendar Calculations & Restrictions
  const currentYear = viewMonth.getFullYear();
  const currentMonthIndex = viewMonth.getMonth();
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayStr = formatDateToYMD(today);

  // Disable previous month button if we are at the current month/year
  const isPrevMonthDisabled =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonthIndex <= today.getMonth());

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setViewMonth(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    if (viewMonth.getFullYear() !== y || viewMonth.getMonth() !== m - 1) {
      setViewMonth(new Date(y, m - 1, 1));
    }
  };

  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  const monthCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    monthCells.push({ key: `blank-${i}`, isBlank: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentYear, currentMonthIndex, day);
    const cellDateStr = formatDateToYMD(cellDate);
    const isPast = cellDate < todayStart;
    const isSelected = cellDateStr === selectedDate;
    const isToday = cellDateStr === todayStr;

    monthCells.push({
      key: `day-${day}`,
      isBlank: false,
      day,
      dateStr: cellDateStr,
      isPast,
      isSelected,
      isToday,
    });
  }

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
      alert(language === 'th' ? 'กรุณาเลือกไฟล์รูปภาพ' : 'Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'th' ? 'ไฟล์ใหญ่เกิน 5MB' : 'File size exceeds 5MB');
      return;
    }
    if (slipPreview) URL.revokeObjectURL(slipPreview);
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [brData, stData, srvData, allBookings] = await Promise.all([
        salonService.getBranches(),
        salonService.getStylists(),
        salonService.getServices(),
        salonService.getBookings(),
      ]);
      setBranches(brData);
      setStylists(stData);
      setServices(srvData);
      setExistingBookings(allBookings);

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

  // Stylists filtered specifically by the categories of selected services!
  const selectedCategories = Array.from(new Set(selectedServices.map((s) => s.category)));
  const availableStylists = stylists.filter((s) => {
    if (s.branch_id !== selectedBranchId || !s.is_active) return false;
    // If services selected, stylist must specialize in at least one selected category
    if (selectedCategories.length > 0) {
      return s.specialties.some((spec) => selectedCategories.includes(spec));
    }
    return true;
  });
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
      alert(language === 'th' ? 'กรุณาแนบสลิปโอนเงินมัดจำก่อนยืนยันการจอง' : 'Please attach bank transfer slip before confirming');
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
          alert(language === 'th' ? 'อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : 'Failed to upload slip. Please try again.');
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
        depositStatus: depositRequired ? (slipUrl ? 'verified' : 'pending_verification') : 'none',
        slipUrl,
        note: bookingNote ? `${bookingNote} (Tel: ${customerPhone})` : `(Tel: ${customerPhone})`,
      });

      // Send rich confirmation Flex Message to LINE chat
      await sendBookingChatMessage({
        serviceNames: selectedServices.map((s) => s.name).join(' + '),
        date: selectedDate,
        time: selectedTime,
        branchName: selectedBranch?.name || 'KIKI Beauty Space',
        stylistName: selectedStylist?.name || (language === 'th' ? 'ช่างคนไหนก็ได้' : 'First Available'),
        totalPrice,
        depositAmount: depositRequired ? depositAmount : 0,
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Booking failed:', err);
      alert(language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกการจองคิว' : 'An error occurred while saving your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { key: ServiceCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: t('allCategories'), icon: '✨' },
    { key: 'hair', label: t('catHair'), icon: '💇‍♀️' },
    { key: 'nails', label: t('catNails'), icon: '💅' },
    { key: 'spa', label: t('catSpa'), icon: '🌿' },
    { key: 'makeup', label: t('catMakeup'), icon: '💄' },
    { key: 'skincare', label: t('catSkincare'), icon: '🧖‍♀️' },
  ];

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
          <span className={currentStep >= 1 ? 'text-[#7a5646] font-bold' : ''}>{t('step1')}</span>
          <span className={currentStep >= 2 ? 'text-[#7a5646] font-bold' : ''}>{t('step2')}</span>
          <span className={currentStep >= 3 ? 'text-[#7a5646] font-bold' : ''}>{t('step3')}</span>
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
              {t('selectBranchTitle')}
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
                  placeholder={t('searchPlaceholder')}
                  className="pl-9 bg-[#fcf9f8] border-[#d4c3bc]/70 rounded-full text-xs h-10"
                />
              </div>

              <div className="text-xs text-[#7a5646] font-medium self-center bg-[#7a5646]/10 px-3 py-1.5 rounded-full">
                💡 {t('multipicklistNotice')}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
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
                {language === 'th' ? 'ไม่พบบริการที่ค้นหา' : 'No services found matching your query'}
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
                            {t('depositRequired')}: ฿{service.deposit_amount}
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
                          {service.duration_minutes} {t('minutes')}
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
          {/* 1. Date Selector (Full Month Calendar Grid with Small Circles) */}
          <div className="bg-[#fcf9f8] p-5 sm:p-6 rounded-2xl border border-[#d4c3bc]/60 shadow-sm space-y-4">
            {/* Header: Month Year and Navigation Buttons */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base uppercase tracking-wider text-[#1b1c1c]">
                  {ENGLISH_MONTH_NAMES[currentMonthIndex]} {currentYear}
                </span>
                {language === 'th' && (
                  <span className="text-xs text-[#7a5646] font-medium hidden sm:inline">
                    ({THAI_FULL_MONTH_NAMES[currentMonthIndex]} {currentYear + 543})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isPrevMonthDisabled}
                  onClick={handlePrevMonth}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isPrevMonthDisabled
                      ? 'bg-muted/40 text-muted-foreground/30 cursor-not-allowed'
                      : 'bg-[#e8ded8] hover:bg-[#d8cac2] text-[#636260] cursor-pointer'
                  }`}
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-full bg-[#e8ded8] hover:bg-[#d8cac2] text-[#636260] flex items-center justify-center transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers: S M T W T F S */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_SHORT_HEADERS.map((w, idx) => (
                <div key={idx} className="text-[11px] sm:text-xs font-semibold text-[#8a8885] py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {monthCells.map((cell) => {
                if (cell.isBlank) {
                  return <div key={cell.key} className="h-8 sm:h-9" />;
                }

                if (cell.isPast) {
                  return (
                    <div
                      key={cell.key}
                      className="w-8 h-8 sm:w-9 sm:h-9 mx-auto flex items-center justify-center text-xs sm:text-sm text-[#b8b3b0]/50 font-normal cursor-not-allowed select-none"
                    >
                      {cell.day}
                    </div>
                  );
                }

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => handleSelectDate(cell.dateStr!)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all select-none cursor-pointer ${
                      cell.isSelected
                        ? 'bg-[#7a5646] text-white font-bold shadow-md ring-2 ring-[#7a5646]/30 scale-105'
                        : cell.isToday
                        ? 'text-[#7a5646] font-bold border border-[#7a5646]/50 hover:bg-[#e8ded8]'
                        : 'text-[#1b1c1c] hover:bg-[#ebdcd4]'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary Display */}
            <div className="p-2.5 bg-[#f5f0ea] rounded-xl flex items-center justify-between text-xs border border-[#d4c3bc]/50 text-[#1b1c1c] mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[#636260]">{t('selectedDateLabel')}</span>
                <span className="font-bold text-[#7a5646]">
                  {formatLocalizedDateDisplay(selectedDate, language)}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-[#7a5646]/40 text-[#7a5646] bg-card">
                {t('dateConfirmed')}
              </Badge>
            </div>
          </div>

          {/* 2. Stylist Selector */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#1b1c1c] mb-1">
              {t('selectStylistTitle')}
            </h3>
            <p className="text-xs text-[#636260] mb-4">
              {t('selectStylistSubtitle')}
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
                <h4 className="font-semibold text-xs leading-tight">{t('anyStylist')}</h4>
                <p className={`text-[10px] mt-0.5 ${selectedStylistId === 'any' ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {t('firstAvailable')}
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

          {/* Time Slots (10:00 - 20:00 every 30 minutes, max 2 clients per slot) */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">
                  {t('selectTimeTitle')} (10:00 - 20:00 น.)
                </h3>
                <p className="text-xs text-[#636260]">
                  {language === 'th'
                    ? 'แสดงรอบเวลาทุก 30 นาที (จำกัดรับบริการสูงสุดรอบละ 2 ท่าน)'
                    : '30-minute intervals (Max capacity: 2 guests per slot)'}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] text-[#7a5646] border-[#7a5646]/40 self-start sm:self-auto">
                ⚡ รอบละ 30 นาที
              </Badge>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
              {TIME_SLOTS_30MIN.map((slot) => {
                // Count active bookings at this branch & date & slot
                const slotBookings = existingBookings.filter(
                  (b) =>
                    b.booking_date === selectedDate &&
                    b.booking_time === slot &&
                    b.branch_id === selectedBranchId &&
                    b.status !== 'cancelled'
                );
                const bookedCount = slotBookings.length;
                const isFull = bookedCount >= 2;
                const isSelected = selectedTime === slot;
                const remaining = Math.max(0, 2 - bookedCount);

                return (
                  <button
                    key={slot}
                    disabled={isFull}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all relative ${
                      isFull
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-[#7a5646] text-white border-[#7a5646] shadow-md ring-2 ring-[#7a5646]/20'
                        : 'bg-card border-[#d4c3bc]/60 text-[#1b1c1c] hover:bg-[#e8ded8] hover:border-[#7a5646]/40'
                    }`}
                  >
                    <span className="font-bold text-xs">{slot} {t('minsShort')}</span>
                    <span
                      className={`text-[9px] mt-0.5 leading-none ${
                        isFull
                          ? 'text-rose-500 font-semibold'
                          : isSelected
                          ? 'text-amber-200'
                          : 'text-[#636260]'
                      }`}
                    >
                      {isFull ? (language === 'th' ? 'เต็ม (2/2)' : 'Full') : (language === 'th' ? `ว่าง ${remaining} ที่` : `${remaining} left`)}
                    </span>
                  </button>
                );
              })}
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
              {t('summaryTitle')}
            </h3>

            {/* Branch & Stylist Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">{t('branch')}</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedBranch?.name}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <User className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">{t('stylist')}</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedStylist?.name || t('anyStylist')}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">{t('appointmentDate')}</span>
                  <span className="font-bold text-[#1b1c1c]">{selectedDate} ({selectedTime} {t('minsShort')})</span>
                </div>
              </div>

              <div className="p-3 bg-[#f6f3f2] rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#7a5646] flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">{t('totalDuration')}</span>
                  <span className="font-bold text-[#1b1c1c]">{totalDuration} {t('minutes')}</span>
                </div>
              </div>
            </div>

            {/* Selected Services List */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#636260] mb-2">{t('serviceItems')} ({selectedServices.length}):</p>
              <div className="space-y-2">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between items-center text-xs py-1.5 border-b border-[#d4c3bc]/30">
                    <span className="text-[#1b1c1c]">{s.name} ({s.duration_minutes} {t('minutes')})</span>
                    <span className="font-serif font-bold text-[#7a5646]">฿{s.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-[#f6f3f2] rounded-2xl border border-[#d4c3bc]/60 space-y-2 text-xs">
              <div className="flex justify-between text-[#636260]">
                <span>{t('totalPrice')}</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              {depositRequired && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span>{t('depositRequired')}</span>
                  <span>฿{depositAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-serif font-bold text-[#1b1c1c] pt-2 border-t border-[#d4c3bc]/40">
                <span>{language === 'th' ? 'ยอดชำระที่ร้านหลังหักมัดจำ' : 'Remaining balance to pay at salon'}</span>
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
                  {t('depositRequired')} (฿{depositAmount.toLocaleString()})
                </h3>
              </div>
              <p className="text-xs text-[#636260]">
                {t('depositNotice')}
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
                <label className="block text-xs font-semibold text-[#1b1c1c] mb-1.5">{t('attachSlip')}:</label>
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
                    <img src={slipPreview} alt="Deposit Slip" className="max-h-48 mx-auto rounded-xl mb-2 object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                  )}
                  {slipUploaded ? (
                    <span className="text-xs font-semibold flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> {t('changeSlip')}
                    </span>
                  ) : (
                    <span className="text-xs">{t('attachSlip')}</span>
                  )}
                </label>
              </div>
            </Card>
          )}

          {/* Customer Phone & Note */}
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#d4c3bc]/60 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">{t('contactPhone')} *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="pl-9 bg-card border-[#d4c3bc] rounded-xl text-xs h-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">{t('customerNote')}</label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder={t('notePlaceholder')}
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
              {selectedServiceIds.length} {t('selectedServicesCount')} • {totalDuration} {t('minutes')}
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
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {t('back')}
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                disabled={selectedServiceIds.length === 0}
                onClick={() => setCurrentStep(2)}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs sm:text-sm px-6 h-11 shadow-md shadow-[#7a5646]/20 font-medium"
              >
                {t('nextSelectDateTime')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs sm:text-sm px-6 h-11 shadow-md shadow-[#7a5646]/20 font-medium"
              >
                {t('nextSummary')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs sm:text-sm px-6 h-11 shadow-md shadow-[#7a5646]/20 font-medium"
              >
                {isSubmitting ? t('submitting') : t('confirmBookingButton')}
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
              <h3 className="font-serif text-2xl font-bold text-[#1b1c1c]">{t('bookingSuccessTitle')}</h3>
              <p className="text-xs text-[#636260] mt-1.5 leading-relaxed">
                {t('bookingSuccessSubtitle')}
              </p>
            </div>

            <div className="p-3 bg-[#f6f3f2] rounded-xl text-xs space-y-1 text-left border border-[#d4c3bc]/50">
              <p><strong>{t('appointmentDate')}:</strong> {selectedDate} ({selectedTime} {t('minsShort')})</p>
              <p><strong>{t('totalDuration')}:</strong> {totalDuration} {t('minutes')}</p>
              <p><strong>{t('totalPrice')}:</strong> ฿{totalPrice.toLocaleString()}</p>
              {depositRequired && (
                <p><strong>{t('depositRequired')}:</strong> <span className="text-amber-800 font-medium">{t('depositStatusPending')}</span></p>
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
                {t('checkMyBookings')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="w-full text-xs text-[#636260]"
              >
                {t('home')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
