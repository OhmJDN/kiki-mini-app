import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salonService } from '@/services/salon-service';
import type { BookingWithRelations, BookingStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<{
    todayCount: number;
    pendingCount: number;
    confirmedCount: number;
    completedCount: number;
    totalBookings: number;
    totalRevenue: number;
    activeServicesCount: number;
    recentBookings: BookingWithRelations[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await salonService.getDashboardStats();
      setStats(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    setActionLoadingId(bookingId);
    try {
      await salonService.updateBookingStatus(bookingId, status);
      await loadDashboard();
    } catch (e) {
      console.error('Update status failed:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">ภาพรวมร้าน (Dashboard)</h1>
          <p className="text-sm text-[#636260] mt-1">
            ข้อมูลการดำเนินงาน นัดหมายลูกค้า และสถิติของ KIKI Beauty Space
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-[#7a5646]/30 text-[#7a5646] hover:bg-[#7a5646]/10 rounded-full text-xs">
            <Link to="/home" target="_blank">
              ดูมุมมองลูกค้า (Customer View)
            </Link>
          </Button>

          <Button asChild className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs px-4">
            <Link to="/admin/services">
              + เพิ่มบริการใหม่
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-[#d4c3bc]/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#636260] uppercase tracking-wider">คิวจองวันนี้</p>
              <h3 className="font-serif text-3xl font-bold text-[#1b1c1c] mt-1">
                {isLoading ? '-' : stats?.todayCount}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">นัดหมายสำหรับวันที่ปัจจุบัน</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-[#d4c3bc]/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">รอการยืนยัน</p>
              <h3 className="font-serif text-3xl font-bold text-amber-700 mt-1">
                {isLoading ? '-' : stats?.pendingCount}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">ต้องการการอนุมัติจากแอดมิน</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-[#d4c3bc]/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">รายได้สำเร็จ</p>
              <h3 className="font-serif text-3xl font-bold text-emerald-800 mt-1">
                ฿{isLoading ? '-' : stats?.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">จากการบริการที่เสร็จสมบูรณ์</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-[#d4c3bc]/60 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#636260] uppercase tracking-wider">บริการที่เปิดอยู่</p>
              <h3 className="font-serif text-3xl font-bold text-[#1b1c1c] mt-1">
                {isLoading ? '-' : stats?.activeServicesCount}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">พร้อมให้ลูกค้าจองออนไลน์</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Quick Bar */}
      {stats && stats.pendingCount > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 p-5 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1b1c1c]">
                  มี {stats.pendingCount} รายการรอการยืนยันจากคุณ
                </h4>
                <p className="text-xs text-[#636260]">
                  โปรดตรวจสอบและกดยืนยันเพื่อล็อกคิวให้ลูกค้า
                </p>
              </div>
            </div>

            <Button asChild size="sm" className="bg-[#7a5646] hover:bg-[#634335] text-white rounded-full text-xs">
              <Link to="/admin/bookings?status=pending">
                จัดการรายการรอยืนยัน <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Bookings Section */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#d4c3bc]/40">
          <div>
            <CardTitle className="font-serif text-lg font-bold text-[#1b1c1c]">
              รายการนัดหมายล่าสุด
            </CardTitle>
            <p className="text-xs text-[#636260]">การจองคิว 5 รายการล่าสุดในระบบ</p>
          </div>

          <Button asChild variant="ghost" size="sm" className="text-xs text-[#7a5646]">
            <Link to="/admin/bookings">ดูทั้งหมด →</Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/40 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">ลูกค้า</th>
                <th className="py-3 px-4 font-semibold">บริการ</th>
                <th className="py-3 px-4 font-semibold">วันที่ & เวลา</th>
                <th className="py-3 px-4 font-semibold">ราคา</th>
                <th className="py-3 px-4 font-semibold">สถานะ</th>
                <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : stats?.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    ยังไม่มีข้อมูลการจอง
                  </td>
                </tr>
              ) : (
                stats?.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f5f0ea]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#1b1c1c]">{b.customer?.display_name || 'ลูกค้าทั่วไป'}</div>
                      <div className="text-[11px] text-[#636260]">{b.customer?.phone || 'ไม่ระบุเบอร์'}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-[#1b1c1c]">
                      {b.service?.name}
                    </td>

                    <td className="py-3 px-4">
                      <div>{b.booking_date}</div>
                      <div className="text-[11px] text-[#7a5646] font-medium">{b.booking_time} น.</div>
                    </td>

                    <td className="py-3 px-4 font-serif font-bold text-[#7a5646]">
                      ฿{b.service?.price.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 rounded-lg"
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                              className="text-rose-600 border-rose-300 hover:bg-rose-50 text-[11px] h-7 px-2.5 rounded-lg"
                            >
                              ปฏิเสธ
                            </Button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <Button
                            size="sm"
                            disabled={actionLoadingId === b.id}
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-2.5 rounded-lg"
                          >
                            เสร็จสิ้นบริการ
                          </Button>
                        )}
                        {b.status === 'completed' && (
                          <span className="text-[11px] text-muted-foreground">สำเร็จ</span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="text-[11px] text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
