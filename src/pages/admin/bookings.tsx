import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import type { BookingWithRelations, BookingStatus, Service } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  X 
} from 'lucide-react';


export function AdminBookingsPage() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>(
    (searchParams.get('status') as BookingStatus) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [viewBooking, setViewBooking] = useState<BookingWithRelations | null>(null);

  // New Walk-in Booking Modal State
  const [isNewBookingModal, setIsNewBookingModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('14:00');
  const [newNote, setNewNote] = useState('ลูกค้าหน้าร้าน (Walk-in)');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bData, sData] = await Promise.all([
        salonService.getBookings({ status: statusFilter }),
        salonService.getServices(),
      ]);
      setBookings(bData);
      setServices(sData);
      if (sData.length > 0 && !newServiceId) {
        setNewServiceId(sData[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await salonService.updateBookingStatus(bookingId, newStatus);
      await loadData();
      if (viewBooking?.id === bookingId) {
        setViewBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newServiceId) return;

    setIsSubmittingNew(true);
    try {
      const fakeCustomer = {
        id: 'walkin-' + Date.now(),
        line_user_id: 'walkin',
        display_name: newCustomerName,
        picture_url: null,
        phone: newCustomerPhone,
        role: 'customer' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await salonService.createBooking({
        customerId: fakeCustomer.id,
        customerProfile: fakeCustomer,
        serviceId: newServiceId,
        bookingDate: newDate,
        bookingTime: newTime,
        note: `${newNote} (โทร: ${newCustomerPhone})`,
      });

      setIsNewBookingModal(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      await loadData();
    } catch (err) {
      console.error('Create walkin failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกการจอง');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const customerMatch = b.customer?.display_name?.toLowerCase().includes(q);
    const phoneMatch = b.customer?.phone?.toLowerCase().includes(q) || b.note?.toLowerCase().includes(q);
    const serviceMatch = b.service?.name?.toLowerCase().includes(q);
    return customerMatch || phoneMatch || serviceMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">จัดการการจองคิว (Bookings)</h1>
          <p className="text-sm text-[#636260] mt-1">
            ตรวจเช็คตารางนัดหมาย อนุมัติคิว และอัปเดตสถานะการเข้ารับบริการ
          </p>
        </div>

        <Button
          onClick={() => setIsNewBookingModal(true)}
          className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-4 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มนัดหมาย Walk-in
        </Button>
      </div>

      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => {
            const labels: Record<string, string> = {
              all: 'ทั้งหมด',
              pending: 'รอยืนยัน',
              confirmed: 'ยืนยันแล้ว',
              completed: 'เสร็จสิ้น',
              cancelled: 'ยกเลิก',
            };
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#7a5646] text-white shadow-sm'
                    : 'bg-card text-[#636260] hover:bg-[#e8ded8] border border-[#d4c3bc]/50'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า, เบอร์ หรือบริการ..."
            className="pl-9 bg-card border-[#d4c3bc]/60 rounded-full text-xs h-9"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/50 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">ลูกค้า</th>
                <th className="py-3 px-4 font-semibold">บริการที่จอง</th>
                <th className="py-3 px-4 font-semibold">วัน-เวลานัด</th>
                <th className="py-3 px-4 font-semibold">ยอดชำระ</th>
                <th className="py-3 px-4 font-semibold">สถานะ</th>
                <th className="py-3 px-4 font-semibold text-right">ปรับสถานะ / การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    กำลังโหลดข้อมูลการจอง...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    ไม่พบรายการจองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f5f0ea]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {b.customer?.picture_url ? (
                          <img src={b.customer.picture_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#7a5646]/10 text-[#7a5646] font-bold flex items-center justify-center text-xs">
                            {b.customer?.display_name?.[0] || 'C'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[#1b1c1c] text-xs">
                            {b.customer?.display_name || 'ลูกค้าทั่วไป'}
                          </div>
                          <div className="text-[11px] text-[#636260]">
                            {b.customer?.phone || 'ไม่ระบุเบอร์'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#1b1c1c]">
                      <div>{b.service?.name}</div>
                      <div className="text-[11px] text-muted-foreground">{b.service?.duration_minutes} นาที</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1b1c1c]">{b.booking_date}</div>
                      <div className="text-[11px] text-[#7a5646] font-semibold">{b.booking_time} น.</div>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-bold text-[#7a5646]">
                      ฿{b.service?.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      {b.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">รอยืนยัน</Badge>
                      )}
                      {b.status === 'confirmed' && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">ยืนยันแล้ว</Badge>
                      )}
                      {b.status === 'completed' && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px]">เสร็จสิ้น</Badge>
                      )}
                      {b.status === 'cancelled' && (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">ยกเลิก</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewBooking(b)}
                          className="text-[11px] text-[#7a5646] h-7 px-2"
                        >
                          รายละเอียด
                        </Button>

                        {b.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(b.id, 'confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 rounded-lg"
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(b.id, 'cancelled')}
                              className="text-rose-600 border-rose-300 hover:bg-rose-50 text-[11px] h-7 px-2 rounded-lg"
                            >
                              ปฏิเสธ
                            </Button>
                          </>
                        )}

                        {b.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(b.id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-2.5 rounded-lg"
                          >
                            เสร็จสิ้น
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Details Modal */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">รายละเอียดการจอง</h3>
              <button onClick={() => setViewBooking(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f5f0ea] rounded-xl space-y-1.5 border border-[#d4c3bc]/50">
                <p><strong>ชื่อลูกค้า:</strong> {viewBooking.customer?.display_name}</p>
                <p><strong>เบอร์โทร:</strong> {viewBooking.customer?.phone || 'ไม่ระบุ'}</p>
                <p><strong>LINE User ID:</strong> {viewBooking.customer?.line_user_id || '-'}</p>
              </div>

              <div className="p-3 bg-[#f5f0ea] rounded-xl space-y-1.5 border border-[#d4c3bc]/50">
                <p><strong>บริการ:</strong> {viewBooking.service?.name}</p>
                <p><strong>ระยะเวลา:</strong> {viewBooking.service?.duration_minutes} นาที</p>
                <p><strong>ราคา:</strong> ฿{viewBooking.service?.price.toLocaleString()}</p>
                <p><strong>วันที่:</strong> {viewBooking.booking_date} เวลา {viewBooking.booking_time} น.</p>
              </div>

              {viewBooking.note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="font-semibold text-amber-900 mb-0.5">หมายเหตุจากลูกค้า:</p>
                  <p className="text-amber-800">{viewBooking.note}</p>
                </div>
              )}
            </div>

            {/* Change Status Options */}
            <div className="pt-2 border-t border-[#d4c3bc]/50">
              <label className="block text-[11px] font-semibold text-[#636260] uppercase mb-2">เปลี่ยนสถานะการจอง:</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(viewBooking.id, 'confirmed')}
                  disabled={viewBooking.status === 'confirmed'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                >
                  ยืนยันคิว
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(viewBooking.id, 'completed')}
                  disabled={viewBooking.status === 'completed'}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl"
                >
                  เสร็จสิ้น
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(viewBooking.id, 'cancelled')}
                  disabled={viewBooking.status === 'cancelled'}
                  className="text-rose-600 border-rose-300 hover:bg-rose-50 text-xs rounded-xl"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Walk-in Booking Modal */}
      {isNewBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">เพิ่มนัดหมายลูกค้าหน้าร้าน (Walk-in)</h3>
              <button onClick={() => setIsNewBookingModal(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#636260] mb-1">ชื่อลูกค้า</label>
                <Input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="เช่น คุณกมลวรรณ"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">เบอร์โทรติดต่อ</label>
                <Input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">เลือกบริการ</label>
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                  required
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - ฿{s.price.toLocaleString()} ({s.duration_minutes} นาที)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">วันที่</label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">เวลา</label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="bg-card border-[#d4c3bc]/60 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">หมายเหตุ</label>
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl font-medium"
                >
                  {isSubmittingNew ? 'กำลังบันทึก...' : 'บันทึกการจอง Walk-in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
