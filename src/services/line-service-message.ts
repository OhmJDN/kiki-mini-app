/**
 * LINE MINI App Service Notification Message API Helper
 * Template: book_request_d_b_en (Booking confirmed (detailed))
 * 
 * Documentation: https://developers.line.biz/en/docs/line-mini-app/develop/service-messages/
 */

export interface LineServiceNotificationParams {
  templateName: 'book_request_d_b_en' | string;
  params: {
    number: string;              // Reservation no.
    date: string;                // Date and time e.g. "13:00 10-07-2026"
    count: string;               // Number of people e.g. "1"
    shop_name: string;           // Location e.g. "KIKI Beauty Space (Sukhumvit 39)"
    address: string;             // Address e.g. "124 Sukhumvit 39, Watthana, Bangkok"
    condition: string;           // Requirements e.g. "Please arrive 10 mins in advance"
    sum: string;                 // Total e.g. "2,500 THB"
    name: string;                // Customer name
    user_number?: string;        // Membership / Line User No.
    reservation_contents: string;// Reservation details e.g. "Hair Cut + Color"
    charge_name: string;         // Assigned Stylist e.g. "Elena (Master Stylist)"
    btn1_url?: string;           // View details URL
    btn2_url?: string;           // Please read URL
    btn3_url?: string;           // Change booking URL
    btn4_url?: string;           // Map info URL
  };
}

/**
 * Creates the exact Service Message payload required by LINE MINI App API
 */
export function buildServiceMessagePayload(
  userId: string,
  booking: {
    id: string;
    customerName: string;
    serviceNames: string;
    bookingDate: string;
    bookingTime: string;
    branchName: string;
    branchAddress?: string;
    stylistName?: string;
    totalPrice: number;
    depositAmount?: number;
  }
) {
  const miniAppBaseUrl = 'https://miniapp.line.me/2011914730-8NETyoXW';

  return {
    templateName: 'book_request_d_b_en',
    params: {
      number: booking.id.slice(0, 8).toUpperCase(),
      date: `${booking.bookingTime} ${booking.bookingDate}`,
      count: '1',
      shop_name: booking.branchName || 'KIKI Beauty Space (Sukhumvit 39)',
      address: booking.branchAddress || '124 Sukhumvit 39, Khlong Tan Nuea, Watthana, Bangkok',
      condition: booking.depositAmount && booking.depositAmount > 0 
        ? `Deposit: ฿${booking.depositAmount.toLocaleString()} verified. Please arrive 10 mins before time.` 
        : 'Please arrive 10 minutes before your appointment time.',
      sum: `${booking.totalPrice.toLocaleString()} THB`,
      name: booking.customerName || 'Valued Guest',
      user_number: userId.slice(0, 8),
      reservation_contents: booking.serviceNames,
      charge_name: booking.stylistName || 'KIKI Master Stylist (First Available)',
      btn1_url: `${miniAppBaseUrl}/bookings`,
      btn2_url: 'https://kikibeautyspace.com',
      btn3_url: `${miniAppBaseUrl}/bookings`,
      btn4_url: 'https://maps.google.com/?q=KIKI+Beauty+Space+Sukhumvit+39',
    },
  };
}
