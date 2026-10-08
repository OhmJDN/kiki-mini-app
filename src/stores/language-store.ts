import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLiffLanguage } from '@/lib/liff';

export type Language = 'th' | 'en';

export const TRANSLATIONS = {
  th: {
    // Navigation
    home: 'หน้าแรก',
    promotions: 'โปรโมชั่น',
    allServices: 'บริการทั้งหมด',
    myBookings: 'การจองของฉัน',
    profile: 'โปรไฟล์ของฉัน',
    adminPortal: 'ระบบจัดการหลังบ้าน',
    login: 'เข้าสู่ระบบ LINE',
    logout: 'ออกจากระบบ',
    connectRealLine: 'เชื่อมต่อ LINE บัญชีจริง',
    customerRole: 'ลูกค้า',
    adminRole: 'ผู้ดูแลระบบ',

    // Home Page
    welcome: 'ยินดีต้อนรับ,',
    specialGuest: 'ลูกค้าคนพิเศษ',
    heroBadge: 'No.1 Luxury Beauty Destination',
    heroTitle: 'ความงามเหนือระดับ ที่ออกแบบเฉพาะคุณ',
    heroSubtitle: 'สัมผัสประสบการณ์ความงามระดับพรีเมียม ผสานไลฟ์สไตล์และแฟชั่น เพื่อการดูแลที่ตอบโจทย์เฉพาะคุณ',
    bookNow: 'จองบริการทันที',
    upcomingAppointmentBadge: 'นัดหมายถัดไปของคุณ',
    viewBookingDetails: 'ดูรายละเอียดนัดหมาย',
    ourServicesTitle: 'เมนูบริการของเรา',
    ourServicesSub: 'ตัดผม ทำสี เล็บ สปา ต่อขนตา',
    myBookingsCardTitle: 'การจองของฉัน',
    myBookingsCardSub: 'ตรวจสอบสถานะ & เลื่อนนัดหมาย',
    featuredServicesTitle: 'บริการยอดนิยม (Signature Services)',
    featuredServicesSub: 'บริการระดับมาสเตอร์ที่ลูกค้าประทับใจมากที่สุด',
    viewAllServices: 'ดูทั้งหมด →',
    bookShort: 'จอง',
    onlineChannelsTitle: 'ร้านค้าออนไลน์ & ช่องทางติดตามทางการ',
    branchesTitle: 'สาขาที่เปิดให้บริการ (KIKI Beauty Space Branches)',
    minsShort: 'น.',

    // Booking Steps
    step1: '1. เลือกสาขา & บริการ',
    step2: '2. วัน เวลา & ช่าง',
    step3: '3. สรุปยอด & มัดจำ',

    // Step 1: Branches & Services
    selectBranchTitle: 'เลือกสาขาที่ต้องการเข้ารับบริการ',
    selectBranchSub: 'เลือกสาขาที่สะดวกสำหรับคุณ',
    searchPlaceholder: 'ค้นหาชื่อบริการ...',
    multipicklistNotice: 'ติ๊กเลือกได้หลายบริการในคิวเดียว (Multipicklist)',
    allCategories: 'ทั้งหมด',
    catHair: 'ทำผม & ทรีทเมนต์',
    catNails: 'ทำเล็บ & สปา',
    catSpa: 'สปา & ผ่อนคลาย',
    catMakeup: 'แต่งหน้า',
    catSkincare: 'บำรุงผิวหน้า',
    selectedServicesCount: 'บริการที่เลือก',
    totalDuration: 'เวลารวม',
    totalAmount: 'ยอดรวม',
    nextSelectDateTime: 'ถัดไป: เลือกวัน & ช่าง',

    // Step 2: Date, Time & Stylist
    selectDateTitle: 'เลือกวันที่นัดหมาย (Select Date)',
    selectDateSubtitle: 'กดเลือกวันที่ต้องการเข้ารับบริการได้ทันที',
    selectedDateLabel: 'วันที่เลือก:',
    dateConfirmed: 'ยืนยันวันแล้ว',
    selectStylistTitle: 'เลือกช่างประจำการจอง (Select Stylist)',
    selectStylistSubtitle: 'เลือกช่างที่ต้องการ หรือเลือก "ช่างคนไหนก็ได้" เพื่อรอบเวลาที่รวดเร็วที่สุด',
    anyStylist: 'ช่างคนไหนก็ได้ (First Available)',
    firstAvailable: 'First Available',
    selectTimeTitle: 'เลือกรอบเวลา (Select Time)',
    morning: 'ช่วงเช้า (Morning)',
    afternoon: 'ช่วงบ่าย - เย็น (Afternoon)',
    nextSummary: 'ถัดไป: สรุปยอด & ชำระมัดจำ',
    back: 'ย้อนกลับ',

    // Step 3: Summary & Deposit
    summaryTitle: 'สรุปข้อมูลการจอง (Booking Summary)',
    summarySubtitle: 'โปรดตรวจสอบรายละเอียดการนัดหมายก่อนกดยืนยัน',
    branch: 'สาขา',
    stylist: 'ช่างผู้ให้บริการ',
    serviceItems: 'บริการที่เลือก',
    appointmentDate: 'วัน-เวลานัด',
    totalPrice: 'ยอดรวมบริการ',
    depositRequired: 'ยอดมัดจำที่ต้องชำระ',
    depositNotice: 'บริการที่เลือกต้องวางเงินมัดจำเพื่อยืนยันคิวช่าง กรุณาสแกน QR Code พร้อมเพย์ และแนบสลิปด้านล่าง',
    noDepositRequired: 'ไม่มีค่ามัดจำล่วงหน้า',
    noDepositNotice: 'บริการที่คุณเลือกไม่ต้องชำระมัดจำล่วงหน้า สามารถกดส่งการจองได้ทันที',
    contactPhone: 'เบอร์โทรศัพท์ติดต่อ',
    phonePlaceholder: 'เช่น 0812345678',
    customerNote: 'หมายเหตุเพิ่มเติม (ถ้ามี)',
    notePlaceholder: 'เช่น มีลายเล็บตัวอย่างมาให้ดู, แพ้สารเคมีบางชนิด...',
    attachSlip: 'แนบสลิปโอนเงินมัดจำ',
    uploadSlipSuccess: 'แนบสลิปเรียบร้อยแล้ว',
    changeSlip: 'เปลี่ยนรูปสลิป',
    confirmBookingButton: 'ยืนยันและส่งการจองคิว',
    submitting: 'กำลังบันทึกข้อมูลการจอง...',

    // Success Modal
    bookingSuccessTitle: 'จองคิวรับบริการสำเร็จ!',
    bookingSuccessSubtitle: 'การนัดหมายของคุณได้รับการบันทึกแล้ว เจ้าหน้าที่จะตรวจสอบและยืนยันคิวโดยเร็วที่สุด',
    checkMyBookings: 'ดูประวัติการจองของฉัน',
    bookAnother: 'จองบริการอื่นเพิ่มเติม',

    // Customer Bookings Page
    myBookingsTitle: 'การจองของฉัน (My Bookings)',
    myBookingsSubtitle: 'ตรวจสอบสถานะนัดหมาย เลื่อนวันเวลา หรือยกเลิกการจอง',
    bookMoreBtn: 'จองบริการเพิ่ม',
    tabUpcoming: 'นัดหมายที่กำลังจะมาถึง',
    tabPast: 'ประวัติการจอง',
    noUpcomingBookings: 'คุณยังไม่มีนัดหมายที่กำลังจะมาถึง สามารถเลือกจองบริการได้เลย',
    noPastBookings: 'ยังไม่มีประวัติการจองก่อนหน้า',
    viewServicesButton: 'ดูเมนูบริการ',
    statusAll: 'ทั้งหมด',
    statusPending: 'รอยืนยันคิว',
    statusConfirmed: 'ยืนยันคิวแล้ว',
    statusCompleted: 'รับบริการแล้ว',
    statusCancelled: 'ยกเลิกแล้ว',
    depositStatusVerified: 'มัดจำแล้ว',
    depositStatusPending: 'สลิปรอตรวจสอบ',
    rescheduleBooking: 'เลื่อนนัดหมาย',
    cancelBooking: 'ยกเลิกการจอง',
    cancelConfirmPrompt: 'คุณต้องการยกเลิกการจองคิวนี้ใช่หรือไม่?',
    rebookService: 'จองซ้ำ',
    bookingIdLabel: 'รหัสการจอง:',
    rescheduleModalTitle: 'เลื่อนเวลานัดหมาย (Reschedule)',
    selectNewDate: 'เลือกวันที่ใหม่ *',
    selectNewTime: 'เลือกรอบเวลาใหม่ *',
    confirmRescheduleBtn: 'ยืนยันเลื่อนนัด',
    rescheduleSuccess: 'เลื่อนเวลานัดหมายเรียบร้อยแล้ว แอดมินจะทำการยืนยันคิวใหม่ให้โดยเร็วครับ',
    minutes: 'นาที',
  },
  en: {
    // Navigation
    home: 'Home',
    promotions: 'Promotions',
    allServices: 'Services',
    myBookings: 'My Bookings',
    profile: 'My Profile',
    adminPortal: 'Admin Portal',
    login: 'Login with LINE',
    logout: 'Logout',
    connectRealLine: 'Connect Real LINE Account',
    customerRole: 'Customer',
    adminRole: 'Administrator',

    // Home Page
    welcome: 'Welcome,',
    specialGuest: 'Valued Guest',
    heroBadge: 'No.1 Luxury Beauty Destination',
    heroTitle: 'Bespoke Luxury Beauty Crafted for You',
    heroSubtitle: 'Experience premium bespoke beauty blending lifestyle and fashion, tailored specifically for you.',
    bookNow: 'Book Appointment Now',
    upcomingAppointmentBadge: 'Your Next Appointment',
    viewBookingDetails: 'View Details',
    ourServicesTitle: 'Our Services',
    ourServicesSub: 'Hair, Color, Nails, Spa, Lashes',
    myBookingsCardTitle: 'My Bookings',
    myBookingsCardSub: 'Check Status & Reschedule',
    featuredServicesTitle: 'Featured Services (Signature)',
    featuredServicesSub: 'Master-crafted treatments most loved by our guests',
    viewAllServices: 'View All →',
    bookShort: 'Book',
    onlineChannelsTitle: 'Official Stores & Channels',
    branchesTitle: 'Our Locations (KIKI Beauty Space)',
    minsShort: 'mins',

    // Booking Steps
    step1: '1. Branch & Services',
    step2: '2. Date, Time & Stylist',
    step3: '3. Summary & Deposit',

    // Step 1: Branches & Services
    selectBranchTitle: 'Select Branch Location',
    selectBranchSub: 'Choose the branch that suits you best',
    searchPlaceholder: 'Search services...',
    multipicklistNotice: 'Select multiple services in one booking (Multipicklist)',
    allCategories: 'All',
    catHair: 'Hair & Treatment',
    catNails: 'Nails & Spa',
    catSpa: 'Spa & Wellness',
    catMakeup: 'Makeup',
    catSkincare: 'Skincare',
    selectedServicesCount: 'Selected Services',
    totalDuration: 'Total Duration',
    totalAmount: 'Total Amount',
    nextSelectDateTime: 'Next: Date & Stylist',

    // Step 2: Date, Time & Stylist
    selectDateTitle: 'Select Appointment Date',
    selectDateSubtitle: 'Choose your preferred date directly',
    selectedDateLabel: 'Selected Date:',
    dateConfirmed: 'Date Selected',
    selectStylistTitle: 'Select Stylist',
    selectStylistSubtitle: 'Choose your favorite stylist or choose "First Available" for quickest slots',
    anyStylist: 'Any Stylist (First Available)',
    firstAvailable: 'First Available',
    selectTimeTitle: 'Select Time Slot',
    morning: 'Morning Slots',
    afternoon: 'Afternoon & Evening Slots',
    nextSummary: 'Next: Summary & Deposit',
    back: 'Back',

    // Step 3: Summary & Deposit
    summaryTitle: 'Booking Summary',
    summarySubtitle: 'Please review your appointment details before confirming',
    branch: 'Location',
    stylist: 'Stylist',
    serviceItems: 'Selected Services',
    appointmentDate: 'Date & Time',
    totalPrice: 'Total Amount',
    depositRequired: 'Deposit Required',
    depositNotice: 'A deposit is required to confirm your booking. Please scan PromptPay QR and upload transfer slip below.',
    noDepositRequired: 'No Deposit Required',
    noDepositNotice: 'No advance deposit is required for this service. You can submit your appointment directly.',
    contactPhone: 'Contact Phone Number',
    phonePlaceholder: 'e.g. 0812345678',
    customerNote: 'Special Requests / Notes (Optional)',
    notePlaceholder: 'e.g. Nail art reference photo, sensitive scalp...',
    attachSlip: 'Attach Bank Transfer Slip',
    uploadSlipSuccess: 'Slip uploaded successfully',
    changeSlip: 'Change Slip Image',
    confirmBookingButton: 'Confirm & Submit Booking',
    submitting: 'Processing your booking...',

    // Success Modal
    bookingSuccessTitle: 'Booking Confirmed!',
    bookingSuccessSubtitle: 'Your appointment has been recorded. Our staff will review and confirm your slot shortly.',
    checkMyBookings: 'View My Bookings',
    bookAnother: 'Book Another Service',

    // Customer Bookings Page
    myBookingsTitle: 'My Appointments',
    myBookingsSubtitle: 'Check your booking status, reschedule or cancel appointments',
    bookMoreBtn: 'Book More',
    tabUpcoming: 'Upcoming Appointments',
    tabPast: 'Booking History',
    noUpcomingBookings: 'You have no upcoming appointments. Feel free to explore and book a service!',
    noPastBookings: 'No past booking history found',
    viewServicesButton: 'Explore Services',
    statusAll: 'All',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    depositStatusVerified: 'Deposit Verified',
    depositStatusPending: 'Slip Pending',
    rescheduleBooking: 'Reschedule',
    cancelBooking: 'Cancel',
    cancelConfirmPrompt: 'Are you sure you want to cancel this booking?',
    rebookService: 'Book Again',
    bookingIdLabel: 'Booking ID:',
    rescheduleModalTitle: 'Reschedule Appointment',
    selectNewDate: 'Select New Date *',
    selectNewTime: 'Select New Time Slot *',
    confirmRescheduleBtn: 'Confirm Reschedule',
    rescheduleSuccess: 'Appointment rescheduled successfully! Our admin will confirm your new slot shortly.',
    minutes: 'mins',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.th;

interface LanguageState {
  language: Language;
  hasUserManuallySet: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  syncLiffLanguage: () => void;
  t: (key: TranslationKey) => string;
}

export function detectLiffOrSystemLanguage(): Language {
  try {
    const liffLang = getLiffLanguage()?.toLowerCase() || '';
    if (liffLang.startsWith('th')) {
      return 'th';
    }
    if (liffLang.startsWith('en')) {
      return 'en';
    }
    if (liffLang) {
      // Non-Thai (Japanese, Chinese, Korean, etc.) -> default to English
      return 'en';
    }
  } catch {}
  return 'th';
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: detectLiffOrSystemLanguage(),
      hasUserManuallySet: false,
      setLanguage: (language: Language) => set({ language, hasUserManuallySet: true }),
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'th' ? 'en' : 'th', 
        hasUserManuallySet: true 
      })),
      syncLiffLanguage: () => {
        const state = get();
        // If the user hasn't explicitly toggled it manually, auto-adapt from LIFF
        if (!state.hasUserManuallySet) {
          const detected = detectLiffOrSystemLanguage();
          if (detected !== state.language) {
            set({ language: detected });
          }
        }
      },
      t: (key: TranslationKey) => {
        const lang = get().language;
        return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.th[key] || String(key);
      },
    }),
    {
      name: 'kiki-language-storage',
    }
  )
);
