import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import type { BookingWithRelations, BookingStatus, Service, Branch, Stylist, DepositStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  X, 
  QrCode, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export function AdminBookingsPage() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>(
    (searchParams.get('status') as BookingStatus) || 'all'
  );
  const [depositFilter, setDepositFilter] = useState<DepositStatus | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal & Slip Preview Modal
  const [viewBooking, setViewBooking] = useState<BookingWithRelations | null>(null);
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // New Walk-in Booking Modal State
  const [isNewBookingModal, setIsNewBookingModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newBranchId, setNewBranchId] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newStylistId, setNewStylistId] = useState('any');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('14:00');
  const [newNote, setNewNote] = useState('ลูกค้าหน้าร้าน (Walk-in)');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, depositFilter, branchFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bData, sData, brData, stData] = await Promise.all([
        salonService.getBookings({ 
          status: statusFilter, 
          depositStatus: depositFilter,
          branchId: branchFilter 
        }),
        salonService.getServices(),
        salonService.getBranches(),
        salonService.getStylists(),
      ]);
      setBookings(bData);
      setServices(sData);
      setBranches(brData);
      setStylists(stData);

      if (sData.length > 0 && !newServiceId) setNewServiceId(sData[0].id);
      if (brData.length > 0 && !newBranchId) setNewBranchId(brData[0].id);
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

  const handleVerifySlip = async (bookingId: string, status: 'verified' | 'rejected') => {
    try {
      await salonService.verifyDepositSlip(bookingId, status);
      await loadData();
      if (viewBooking?.id === bookingId) {
        setViewBooking((prev) => (prev ? { ...prev, deposit_status: status, status: status === 'verified' ? 'confirmed' : prev.status } : null));
      }
      setPreviewSlipUrl(null);
    } catch (err) {
      console.error('Verify slip failed:', err);
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
        branchId: newBranchId,
        serviceIds: [newServiceId],
        stylistId: newStylistId,
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
    const serviceMatch = (b.services || [b.service]).some((s) => s?.name.toLowerCase().includes(q));
    return customerMatch || phoneMatch || serviceMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">จัดการการจองคิว & ตรวจสลิป (Bookings & Slips)</h1>
          <p className="text-sm text-[#636260] mt-1">
            ตรวจเช็คตารางนัดหมาย อนุมัติคิว ตรวจสอบสลิปมัดจำ และบันทึกคิว Walk-in
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

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => {
              const labels: Record<string, string> = {
                all: 'ทุกสถานะ',
                pending: 'รอยืนยันคิว',
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

            {/* Special Deposit Tab */}
            <button
              onClick={() => setDepositFilter(depositFilter === 'pending_verification' ? 'all' : 'pending_verification')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                depositFilter === 'pending_verification'
                  ? 'bg-amber-700 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>รอตรวจสลิปมัดจำ</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อลูกค้า, เบอร์, บริการ..."
              className="pl-9 bg-card border-[#d4c3bc]/60 rounded-full text-xs h-9"
            />
          </div>
        </div>

        {/* Branch Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#636260]">กรองตามสาขา:</span>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-card border border-[#d4c3bc] rounded-lg px-2.5 py-1 text-xs text-[#1b1c1c] outline-none"
          >
            <option value="all">ทุกสาขา</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/50 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">ลูกค้า</th>
                <th className="py-3 px-4 font-semibold">สาขา & ช่าง</th>
                <th className="py-3 px-4 font-semibold">บริการที่จอง</th>
                <th className="py-3 px-4 font-semibold">วัน-เวลานัด</th>
                <th className="py-3 px-4 font-semibold">ยอดเงิน & มัดจำ</th>
                <th className="py-3 px-4 font-semibold">สถานะคิว</th>
                <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    กำลังโหลดข้อมูลการจอง...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    ไม่พบรายการจองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const serviceNames = (b.services || [b.service]).map((s) => s?.name).filter(Boolean).join(' + ');
                  return (
                    <tr key={b.id} className="hover:bg-[#f5f0ea]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-[#1b1c1c]">
                          {b.customer?.display_name || 'ลูกค้าทั่วไป'}
                        </div>
                        <div className="text-[11px] text-[#636260]">
                          {b.customer?.phone || 'ไม่ระบุเบอร์'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#1b1c1c]">
                        <div className="font-medium text-[11px]">{b.branch?.name?.split(' (')[0] || 'สุขุมวิท 39'}</div>
                        <div className="text-[11px] text-[#7a5646]">ช่าง: {b.stylist?.name || 'คนไหนก็ได้'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#1b1c1c] max-w-xs">
                        <div className="truncate">{serviceNames}</div>
                        <div className="text-[11px] text-muted-foreground">{b.total_duration_minutes || b.service?.duration_minutes || 60} นาที</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1b1c1c]">{b.booking_date}</div>
                        <div className="text-[11px] text-[#7a5646] font-semibold">{b.booking_time} น.</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-[#7a5646]">
                          ฿{(b.total_price || b.service?.price || 0).toLocaleString()}
                        </div>
                        {b.deposit_amount > 0 ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-amber-800">มัดจำ ฿{b.deposit_amount}</span>
                            {b.slip_url && (
                              <button
                                onClick={() => setPreviewSlipUrl(b.slip_url || null)}
                                className="text-[10px] text-blue-600 underline hover:text-blue-800"
                              >
                                [ดูสลิป]
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">ไม่มีมัดจำ</span>
                        )}
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

                          {b.deposit_status === 'pending_verification' && b.slip_url && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setViewBooking(b);
                                setPreviewSlipUrl(b.slip_url || null);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] h-7 px-2.5 rounded-lg"
                            >
                              ตรวจสลิป
                            </Button>
                          )}

                          {b.status === 'pending' && b.deposit_status !== 'pending_verification' && (
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slip Preview & Verification Modal */}
      {previewSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-sm text-[#1b1c1c]">ตรวจสอบสลิปโอนเงินมัดจำ</h3>
              <button onClick={() => setPreviewSlipUrl(null)} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#d4c3bc] max-h-80 flex items-center justify-center bg-black/5">
              <img src={previewSlipUrl} alt="Slip" className="w-full h-full object-contain" />
            </div>

            {viewBooking && (
              <div className="space-y-2">
                <div className="p-2.5 bg-[#f6f3f2] rounded-xl text-xs space-y-0.5">
                  <p><strong>ลูกค้า:</strong> {viewBooking.customer?.display_name}</p>
                  <p><strong>ยอดมัดจำ:</strong> ฿{viewBooking.deposit_amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    onClick={() => handleVerifySlip(viewBooking.id, 'verified')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl py-4"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> ยืนยันสลิปถูกต้อง
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVerifySlip(viewBooking.id, 'rejected')}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 text-xs rounded-xl py-4"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> สลิปไม่ถูกต้อง
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {viewBooking && !previewSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcf9f8] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#d4c3bc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4c3bc]/50 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1b1c1c]">รายละเอียดการจองคิว</h3>
              <button onClick={() => setViewBooking(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f5f0ea] rounded-xl space-y-1 border border-[#d4c3bc]/50">
                <p><strong>ชื่อลูกค้า:</strong> {viewBooking.customer?.display_name}</p>
                <p><strong>เบอร์โทร:</strong> {viewBooking.customer?.phone || 'ไม่ระบุ'}</p>
                <p><strong>สาขา:</strong> {viewBooking.branch?.name}</p>
                <p><strong>ช่าง:</strong> {viewBooking.stylist?.name || 'ช่างคนไหนก็ได้'}</p>
              </div>

              <div className="p-3 bg-[#f5f0ea] rounded-xl space-y-1 border border-[#d4c3bc]/50">
                <p><strong>บริการ:</strong> {(viewBooking.services || [viewBooking.service]).map((s) => s?.name).join(' + ')}</p>
                <p><strong>เวลารวม:</strong> {viewBooking.total_duration_minutes || 60} นาที</p>
                <p><strong>ยอดรวม:</strong> ฿{(viewBooking.total_price || 0).toLocaleString()}</p>
                <p><strong>วัน-เวลานัด:</strong> {viewBooking.booking_date} เวลา {viewBooking.booking_time} น.</p>
                {viewBooking.deposit_amount > 0 && (
                  <p><strong>มัดจำ:</strong> ฿{viewBooking.deposit_amount.toLocaleString()} ({viewBooking.deposit_status})</p>
                )}
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
                <label className="block font-semibold text-[#636260] mb-1">ชื่อลูกค้า *</label>
                <Input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="เช่น คุณกมลวรรณ"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">เบอร์โทรติดต่อ *</label>
                <Input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  required
                  className="bg-card border-[#d4c3bc]/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">สาขา</label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#636260] mb-1">ช่าง</label>
                  <select
                    value={newStylistId}
                    onChange={(e) => setNewStylistId(e.target.value)}
                    className="w-full bg-card border border-[#d4c3bc]/60 rounded-xl p-2.5 text-xs text-[#1b1c1c] outline-none"
                  >
                    <option value="any">ช่างคนไหนก็ได้</option>
                    {stylists.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.title})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#636260] mb-1">บริการ</label>
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
