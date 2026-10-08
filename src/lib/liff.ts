import liff from '@line/liff';

const LIFF_ID_FALLBACK = '2011914730-8NETyoXW';
const rawLiffId = import.meta.env.VITE_LIFF_ID;
const liffId = (rawLiffId && rawLiffId !== 'your_liff_id_here' && !rawLiffId.includes('YOUR_LIFF')) 
  ? rawLiffId 
  : LIFF_ID_FALLBACK;

export const isLiffConfigured = Boolean(liffId);

let liffInitPromise: Promise<void> | null = null;
let isLiffInited = false;

export const initializeLiff = async (): Promise<void> => {
  if (!isLiffConfigured) {
    return;
  }
  if (isLiffInited) {
    return;
  }
  if (!liffInitPromise) {
    liffInitPromise = (async () => {
      try {
        await liff.init({ liffId });
        isLiffInited = true;
      } catch (error) {
        console.warn('LIFF initialization failed:', error);
      }
    })();
  }
  return liffInitPromise;
};

export const isInLineApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes('line') || (typeof liff !== 'undefined' && typeof liff.isInClient === 'function' && liff.isInClient());
};

export const isInLiffBrowser = (): boolean => {
  try {
    return liff.isInClient() || isInLineApp();
  } catch {
    return isInLineApp();
  }
};

export const getLiffLanguage = (): string => {
  try {
    if (typeof liff !== 'undefined' && typeof liff.getLanguage === 'function') {
      const lang = liff.getLanguage();
      if (lang) return lang;
    }
  } catch (e) {
    console.warn('Failed to get LIFF language:', e);
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'th';
};

export const getLiffContext = () => {
  try {
    if (typeof liff !== 'undefined' && typeof liff.getContext === 'function') {
      return liff.getContext();
    }
  } catch (e) {
    console.warn('Failed to get LIFF context:', e);
  }
  return null;
};

export const getLiffProfile = async () => {
  await initializeLiff();
  try {
    if (!liff.isLoggedIn()) {
      return null;
    }
    const profile = await liff.getProfile();
    return profile;
  } catch (error) {
    console.warn('Failed to get LIFF profile:', error);
    return null;
  }
};

export const loginWithLine = async (customRedirectUri?: string): Promise<void> => {
  await initializeLiff();
  if (!liff.isLoggedIn()) {
    // In external browser, ensure redirectUri points to current origin/path cleanly
    const redirectUri = customRedirectUri || window.location.href;
    liff.login({ redirectUri });
  }
};

export const closeLiff = (): void => {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
};

export interface BookingMessagePayload {
  serviceNames: string;
  date: string;
  time: string;
  branchName: string;
  stylistName: string;
  totalPrice: number;
  depositAmount?: number;
  bookingId?: string;
}

export const sendBookingChatMessage = async (payload: BookingMessagePayload | string, date?: string, time?: string, price?: number): Promise<boolean> => {
  if (!liff.isInClient()) return false;

  let serviceNames = '';
  let bookDate = '';
  let bookTime = '';
  let totalPrice = 0;
  let branchName = 'KIKI Beauty Space';
  let stylistName = 'First Available';
  let depositAmount = 0;

  if (typeof payload === 'string') {
    serviceNames = payload;
    bookDate = date || '';
    bookTime = time || '';
    totalPrice = price || 0;
  } else {
    serviceNames = payload.serviceNames;
    bookDate = payload.date;
    bookTime = payload.time;
    totalPrice = payload.totalPrice;
    branchName = payload.branchName || 'KIKI Beauty Space';
    stylistName = payload.stylistName || 'First Available';
    depositAmount = payload.depositAmount || 0;
  }

  try {
    // 1. Try sending as a Luxury LINE Flex Message
    const flexMessage = {
      type: 'flex' as const,
      altText: `✨ ยืนยันการจอง KIKI Beauty Space: ${serviceNames} (${bookDate})`,
      contents: {
        type: 'bubble' as const,
        hero: {
          type: 'image' as const,
          url: 'https://kikibeautyspace.com/wp-content/uploads/2025/01/photos-nng-07-scaled-2.jpg',
          size: 'full' as const,
          aspectRatio: '20:11' as const,
          aspectMode: 'cover' as const,
        },
        body: {
          type: 'box' as const,
          layout: 'vertical' as const,
          contents: [
            {
              type: 'text' as const,
              text: 'KIKI BEAUTY SPACE',
              weight: 'bold' as const,
              color: '#7A5646',
              size: 'xxs' as const,
              letterSpacing: '2px' as const,
            },
            {
              type: 'text' as const,
              text: 'ยืนยันการจองคิวรับบริการ',
              weight: 'bold' as const,
              size: 'lg' as const,
              margin: 'xs' as const,
              color: '#1B1C1C',
            },
            {
              type: 'separator' as const,
              margin: 'md' as const,
              color: '#E8DED8',
            },
            {
              type: 'box' as const,
              layout: 'vertical' as const,
              margin: 'md' as const,
              spacing: 'sm' as const,
              contents: [
                {
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  spacing: 'sm' as const,
                  contents: [
                    { type: 'text' as const, text: 'บริการ', color: '#8A8885', size: 'xs' as const, flex: 2 },
                    { type: 'text' as const, text: serviceNames, wrap: true, color: '#1B1C1C', size: 'xs' as const, weight: 'bold' as const, flex: 5 },
                  ],
                },
                {
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  spacing: 'sm' as const,
                  contents: [
                    { type: 'text' as const, text: 'วัน-เวลา', color: '#8A8885', size: 'xs' as const, flex: 2 },
                    { type: 'text' as const, text: `${bookDate} เวลา ${bookTime} น.`, color: '#7A5646', size: 'xs' as const, weight: 'bold' as const, flex: 5 },
                  ],
                },
                {
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  spacing: 'sm' as const,
                  contents: [
                    { type: 'text' as const, text: 'สาขา', color: '#8A8885', size: 'xs' as const, flex: 2 },
                    { type: 'text' as const, text: branchName, wrap: true, color: '#1B1C1C', size: 'xs' as const, flex: 5 },
                  ],
                },
                {
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  spacing: 'sm' as const,
                  contents: [
                    { type: 'text' as const, text: 'ช่าง', color: '#8A8885', size: 'xs' as const, flex: 2 },
                    { type: 'text' as const, text: stylistName, color: '#1B1C1C', size: 'xs' as const, flex: 5 },
                  ],
                },
                {
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  spacing: 'sm' as const,
                  contents: [
                    { type: 'text' as const, text: 'ยอดรวม', color: '#8A8885', size: 'xs' as const, flex: 2 },
                    { type: 'text' as const, text: `฿${totalPrice.toLocaleString()}`, color: '#7A5646', size: 'sm' as const, weight: 'bold' as const, flex: 5 },
                  ],
                },
                ...(depositAmount > 0 ? [{
                  type: 'box' as const,
                  layout: 'baseline' as const,
                  spacing: 'sm' as const,
                  contents: [
                    { type: 'text' as const, text: 'มัดจำ', color: '#8A8885', size: 'xs' as const, flex: 2 },
                    { type: 'text' as const, text: `฿${depositAmount.toLocaleString()} (แนบสลิปแล้ว)`, color: '#B45309', size: 'xs' as const, weight: 'bold' as const, flex: 5 },
                  ],
                }] : []),
              ],
            },
          ],
        },
        footer: {
          type: 'box' as const,
          layout: 'vertical' as const,
          spacing: 'sm' as const,
          contents: [
            {
              type: 'button' as const,
              style: 'primary' as const,
              height: 'sm' as const,
              color: '#7A5646',
              action: {
                type: 'uri' as const,
                label: 'ดูประวัติการจองของฉัน',
                uri: 'https://miniapp.line.me/2011914730-8NETyoXW/bookings',
              },
            },
          ],
        },
      },
    };

    await liff.sendMessages([flexMessage as any]);
    return true;
  } catch (flexError) {
    console.warn('Flex message failed, falling back to text message:', flexError);
    try {
      // 2. Fallback to clean Text Message
      await liff.sendMessages([
        {
          type: 'text',
          text: `✨ นัดหมายบริการ KIKI Beauty Space เรียบร้อยแล้ว!\n\n💇‍♀️ บริการ: ${serviceNames}\n📅 วันที่: ${bookDate}\n⏰ เวลา: ${bookTime} น.\n📍 สาขา: ${branchName}\n✂️ ช่าง: ${stylistName}\n💰 ยอดรวม: ฿${totalPrice.toLocaleString()}\n\nเจ้าหน้าที่จะตรวจสอบและยืนยันคิวให้คุณโดยเร็วค่ะ 💖`,
        },
      ]);
      return true;
    } catch (textError) {
      console.warn('Failed to send text message:', textError);
      return false;
    }
  }
};

export { liff };

