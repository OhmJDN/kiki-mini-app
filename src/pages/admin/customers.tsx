import { useState, useEffect } from 'react';
import { salonService } from '@/services/salon-service';
import type { Profile } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Array<Profile & { total_bookings: number }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await salonService.getCustomers();
      setCustomers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.display_name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.line_user_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1b1c1c]">ฐานข้อมูลลูกค้า (Customers)</h1>
          <p className="text-sm text-[#636260] mt-1">
            รายชื่อลูกค้า ประวัติการติดต่อ และจำนวนครั้งที่เข้าใช้บริการ KIKI Beauty Space
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า, เบอร์ หรือ LINE ID..."
            className="pl-9 bg-card border-[#d4c3bc]/60 rounded-full text-xs h-9"
          />
        </div>
      </div>

      {/* Customer Table */}
      <Card className="bg-card border-[#d4c3bc]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0ea] border-b border-[#d4c3bc]/50 text-[#636260]">
              <tr>
                <th className="py-3 px-4 font-semibold">ลูกค้า</th>
                <th className="py-3 px-4 font-semibold">เบอร์โทรศัพท์</th>
                <th className="py-3 px-4 font-semibold">LINE User ID</th>
                <th className="py-3 px-4 font-semibold">บทบาท</th>
                <th className="py-3 px-4 font-semibold">จำนวนคิวที่เคยจอง</th>
                <th className="py-3 px-4 font-semibold text-right">ดูการจอง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c3bc]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    กำลังโหลดรายชื่อลูกค้า...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    ไม่พบข้อมูลลูกค้า
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f5f0ea]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {c.picture_url ? (
                          <img
                            src={c.picture_url}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-[#7a5646]/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#7a5646]/10 text-[#7a5646] font-bold flex items-center justify-center text-xs">
                            {c.display_name?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-sm text-[#1b1c1c]">{c.display_name}</div>
                          <div className="text-[11px] text-[#636260]">
                            สมัครเมื่อ {new Date(c.created_at).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#1b1c1c] font-medium">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#7a5646]" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {c.line_user_id}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.role === 'admin' ? (
                        <Badge className="bg-[#7a5646] text-white text-[10px]">ผู้ดูแลระบบ</Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#7a5646]/40 text-[#7a5646] text-[10px]">
                          ลูกค้าทั่วไป
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1b1c1c] text-sm">{c.total_bookings}</span>
                      <span className="text-muted-foreground ml-1 text-xs">ครั้ง</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#7a5646] hover:bg-[#7a5646]/10 h-7 px-2.5 rounded-lg"
                      >
                        <Link to={`/admin/bookings?search=${encodeURIComponent(c.display_name)}`}>
                          ดูคิวของลูกค้านี้ →
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
