import liff from '@line/liff';

const liffId = import.meta.env.VITE_LIFF_ID;

export const isLiffConfigured = Boolean(
  liffId && 
  liffId !== 'your_liff_id_here' && 
  !liffId.includes('YOUR_LIFF')
);

export const initializeLiff = async (): Promise<void> => {
  if (!isLiffConfigured) {
    console.info('LIFF ID is not configured or in development mode.');
    return;
  }
  try {
    await liff.init({ liffId });
  } catch (error) {
    console.warn('LIFF initialization failed:', error);
  }
};

export const getLiffProfile = async () => {
  if (!liff.isLoggedIn()) {
    liff.login();
    return null;
  }
  const profile = await liff.getProfile();
  return profile;
};

export const isInLiffBrowser = (): boolean => {
  return liff.isInClient();
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

