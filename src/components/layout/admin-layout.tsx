import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { loginAsDemo } from '@/features/auth/auth-service';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  LogOut, 
  MapPin, 
  UserCheck, 
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() && passcode !== 'kiki2026' && passcode !== '8888') {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง (รหัสเริ่มต้น: kiki2026)');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      await loginAsDemo('admin');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If not logged in as admin, provide a dedicated Admin Gate
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#1b1c1c] flex items-center justify-center p-4 selection:bg-[#7a5646] selection:text-white">
        <div className="bg-[#242525] max-w-sm w-full p-8 rounded-3xl border border-[#3e3b39] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#7a5646]/20 text-amber-200 flex items-center justify-center mx-auto border border-[#7a5646]/40 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7a5646]/30 text-amber-200 text-[10px] font-semibold tracking-wider uppercase mb-2">
              Staff & Manager Portal
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">KIKI Admin Back-Office</h2>
            <p className="text-xs text-[#a09e9c] mt-1.5 leading-relaxed">
              ระบบศูนย์ควบคุมร้านสำหรับผู้จัดการและเจ้าหน้าที่
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 pt-1 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-[#c8c5c3] mb-1">รหัสผ่านผู้ดูแลระบบ (Passcode)</label>
              <Input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="กรอกรหัส หรือกดเข้าสู่ระบบทันที"
                className="bg-[#1b1c1c] border-[#3e3b39] text-white rounded-xl text-xs h-11 focus:border-[#7a5646]"
              />
              {errorMsg ? (
                <p className="text-[11px] text-rose-400 mt-1">{errorMsg}</p>
              ) : (
                <p className="text-[10px] text-[#7a7876] mt-1">รหัสผ่านเริ่มต้น: kiki2026 หรือกดเข้าสู่ระบบได้ทันที</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-xl text-xs font-semibold shadow-lg shadow-[#7a5646]/30"
            >
              {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบผู้ดูแลร้าน'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'ภาพรวมร้าน', path: '/admin', icon: LayoutDashboard },
    { name: 'การจอง & สลิป', path: '/admin/bookings', icon: Calendar },
    { name: 'จัดการบริการ', path: '/admin/services', icon: Scissors },
    { name: 'ช่าง & ตารางงาน', path: '/admin/stylists', icon: UserCheck },
    { name: 'จัดการสาขา', path: '/admin/branches', icon: MapPin },
    { name: 'ฐานข้อมูลลูกค้า', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0ea] flex flex-col md:flex-row text-[#1b1c1c] selection:bg-[#7a5646] selection:text-white">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#d4c3bc]/60 bg-card">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-[#d4c3bc]/50 gap-2.5">
          <img src="https://kikibeautyspace.com/wp-content/themes/kiki/theme/assets/images/logo-icon.png" alt="KIKI" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-serif font-bold text-base tracking-widest text-[#1b1c1c]">KIKI</span>
            <span className="text-[10px] uppercase tracking-wider text-[#7a5646] block -mt-1 font-bold">Admin Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-5">
          <nav className="grid gap-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#7a5646] text-white shadow-sm'
                      : 'text-[#636260] hover:bg-[#e8ded8] hover:text-[#1b1c1c]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-[#d4c3bc]/50 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-[#f5f0ea] rounded-2xl border border-[#d4c3bc]/50">
            <div className="w-8 h-8 rounded-full bg-[#7a5646]/20 text-[#7a5646] flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-[#1b1c1c]">{user?.display_name || 'Admin'}</span>
              <span className="text-[10px] text-[#636260]">ผู้ดูแลระบบ</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[#636260] hover:text-rose-600 hover:bg-rose-50 border-[#d4c3bc]/60 rounded-xl text-xs h-9"
            onClick={() => {
              logout();
              navigate('/admin');
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex h-16 items-center justify-between px-4 border-b border-[#d4c3bc]/50 bg-card">
        <div className="flex items-center gap-2">
          <img src="https://kikibeautyspace.com/wp-content/themes/kiki/theme/assets/images/logo-icon.png" alt="KIKI" className="w-7 h-7 object-contain" />
          <span className="font-serif font-bold text-base text-[#1b1c1c]">KIKI Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              logout();
              navigate('/admin');
            }} 
            className="text-[#636260] text-xs flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากระบบ
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden border-t border-[#d4c3bc]/60 bg-card sticky bottom-0 z-30 shadow-lg">
        <div className="grid grid-cols-6 h-16 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-0.5 ${
                  isActive ? 'text-[#7a5646] font-semibold' : 'text-[#636260]'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] text-center leading-tight line-clamp-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster />
    </div>
  );
}
