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

export const loginWithLine = async (): Promise<void> => {
  await initializeLiff();
  if (!liff.isLoggedIn()) {
    liff.login();
  }
};

export const closeLiff = (): void => {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
};

export const sendBookingChatMessage = async (serviceName: string, date: string, time: string, price: number): Promise<boolean> => {
  if (!liff.isInClient()) return false;
  try {
    await liff.sendMessages([
      {
        type: 'text',
        text: `✨ นัดหมายบริการ KIKI Beauty Space เรียบร้อยแล้ว!\n\n💇‍♀️ บริการ: ${serviceName}\n📅 วันที่: ${date}\n⏰ เวลา: ${time} น.\n💰 ราคา: ฿${price.toLocaleString()}\n\n📍 สถานที่: KIKI Beauty Space (สุขุมวิท 39)\nเจ้าหน้าที่จะตรวจสอบและยืนยันคิวให้คุณโดยเร็วค่ะ`,
      },
    ]);
    return true;
  } catch (error) {
    console.warn('Failed to send LINE message:', error);
    return false;
  }
};

export { liff };

