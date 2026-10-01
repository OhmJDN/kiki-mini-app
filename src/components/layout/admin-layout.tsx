import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { loginAsDemo } from '@/features/auth/auth-service';
import { Toaster } from '@/components/ui/toaster';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  LogOut, 
  Sparkles, 
  ArrowLeft,
  ShieldCheck,
  MapPin,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // If not logged in as admin, provide a 1-click unlock button instead of a blind redirect
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center p-4">
        <div className="bg-card max-w-md w-full p-8 rounded-3xl border border-[#d4c3bc] shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1b1c1c]">ระบบผู้ดูแลร้าน KIKI</h2>
            <p className="text-xs text-[#636260] mt-1.5 leading-relaxed">
              หน้านี้สำหรับผู้จัดการและเจ้าหน้าที่ร้าน กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={async () => {
                await loginAsDemo('admin');
              }}
              className="w-full bg-[#7a5646] hover:bg-[#634335] text-white py-5 rounded-2xl text-xs font-semibold shadow-md"
            >
              เข้าสู่ระบบด้วยบัญชีผู้จัดการร้าน (Demo Admin)
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/home')}
              className="w-full border-[#7a5646]/30 text-[#7a5646] rounded-2xl text-xs py-5"
            >
              กลับไปยังหน้าลูกค้า (Customer Space)
            </Button>
          </div>
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
          <div className="w-8 h-8 rounded-full bg-[#7a5646] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
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
          <Link
            to="/home"
            className="flex items-center gap-2 text-xs text-[#7a5646] hover:underline font-medium px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>สลับไปหน้าลูกค้า</span>
          </Link>

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
              navigate('/');
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
          <div className="w-7 h-7 rounded-full bg-[#7a5646] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          </div>
          <span className="font-serif font-bold text-base text-[#1b1c1c]">KIKI Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-xs text-[#7a5646]">
            <Link to="/home">หน้าลูกค้า</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} className="text-[#636260]">
            <LogOut className="w-4 h-4" />
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
