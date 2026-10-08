import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { authenticateWithLine } from '@/features/auth/auth-service';
import { loginWithLine, isInLineApp, openInLineApp } from '@/lib/liff';
import { Toaster } from '@/components/ui/toaster';
import { 
  Home, 
  Calendar, 
  Scissors, 
  LogOut, 
  ChevronDown,
  LogIn,
  Globe,
  Smartphone,
  X,
  Tag,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KikiLogo } from '@/components/common/kiki-logo';
import { useLanguageStore } from '@/stores/language-store';
import { CustomerOnboardingModal } from '@/components/common/customer-onboarding-modal';

export function CustomerLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, toggleLanguage, syncLiffLanguage, t } = useLanguageStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isLineClient = isInLineApp();

  useEffect(() => {
    // Automatically synchronize language from LIFF / Line client
    syncLiffLanguage();
    // When inside LINE or if user has demo cache, automatically pull real LINE profile
    if (isLineClient || !user || user.line_user_id?.startsWith('demo_') || user.display_name?.includes('มินตรา')) {
      authenticateWithLine();
    }
  }, [isLineClient]);

  // Check if user is logged in for the first time without customer_type set
  useEffect(() => {
    if (isAuthenticated && user && !user.customer_type) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, user?.customer_type]);

  const handleLogin = async () => {
    if (isLineClient) {
      await authenticateWithLine(true);
    } else {
      await loginWithLine();
    }
  };

  const navItems = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('promotions'), path: '/promotions', icon: Tag },
    { name: t('allServices'), path: '/services', icon: Scissors },
    { name: t('myBookings'), path: '/bookings', icon: Calendar },
    { name: t('profile'), path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0ea] text-[#1b1c1c] pb-20 selection:bg-[#7a5646] selection:text-white">
      {/* Top Banner when opened in External Browser */}
      {!isLineClient && !dismissBanner && (
        <div className="bg-[#1b1c1c] text-[#f5f0ea] text-xs px-3 py-2 flex items-center justify-between gap-2 border-b border-[#7a5646]/30 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <Smartphone className="w-3.5 h-3.5 text-[#06C755] shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">
              {language === 'th'
                ? 'เปิดผ่านแอป LINE เพื่อเข้าสู่ระบบและรับการแจ้งเตือนคิวอัตโนมัติ'
                : 'Open in LINE app for seamless login and real-time queue alerts'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openInLineApp(location.pathname)}
              className="bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95"
            >
              <span>{language === 'th' ? 'เปิดใน LINE' : 'Open in LINE'}</span>
            </button>
            <button
              onClick={() => setDismissBanner(true)}
              className="text-white/60 hover:text-white p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#d4c3bc]/50 bg-[#f5f0ea]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <KikiLogo className="w-12 h-12 text-[#1b1c1c] group-hover:scale-105 transition-transform shrink-0" />
            <div>
              <span className="font-serif font-bold text-lg tracking-widest text-[#1b1c1c] block leading-none">KIKI</span>
              <span className="text-[9px] uppercase tracking-widest text-[#7a5646] font-semibold">BEAUTY SPACE</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#7a5646] text-white shadow-sm'
                      : 'text-[#636260] hover:text-[#1b1c1c] hover:bg-[#e8ded8]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Right Actions (Language Switcher + User Profile) */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#d4c3bc]/60 bg-card hover:bg-[#e8ded8] text-[#7a5646] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Change Language (เปลี่ยนภาษา)"
            >
              <Globe className="w-3 h-3 text-[#7a5646]" />
              <span>{language === 'th' ? 'TH' : 'EN'}</span>
            </button>

            {/* User Profile / Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-[#e8ded8] transition-colors border border-[#d4c3bc]/60 bg-card pr-3"
                >
                  {user.picture_url ? (
                    <img
                      src={user.picture_url}
                      alt={user.display_name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#7a5646]/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#7a5646]/10 text-[#7a5646] flex items-center justify-center font-bold text-xs">
                      {user.display_name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#1b1c1c] max-w-[100px] truncate hidden sm:inline">
                    {user.display_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#636260]" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl shadow-xl border border-[#d4c3bc]/70 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-[#d4c3bc]/40">
                      <p className="text-xs font-semibold text-[#1b1c1c]">{user.display_name}</p>
                      <p className="text-[11px] text-[#636260] capitalize">{user.role === 'admin' ? t('adminRole') : t('customerRole')}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs text-[#7a5646] hover:bg-[#f5f0ea] flex items-center gap-2 font-medium"
                      >
                        <User className="w-3.5 h-3.5" />
                        {t('profile')}
                      </Link>

                      <Link
                        to="/promotions"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs text-[#7a5646] hover:bg-[#f5f0ea] flex items-center gap-2 font-medium"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {t('promotions')}
                      </Link>

                      <Link
                        to="/bookings"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs text-[#7a5646] hover:bg-[#f5f0ea] flex items-center gap-2 font-medium"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {t('myBookings')}
                      </Link>

                      {user?.line_user_id?.startsWith('demo_') && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleLogin();
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-[#06C755] hover:bg-emerald-50 flex items-center gap-2 font-medium"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          {t('connectRealLine')}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleLogin}
                className="bg-[#06C755] hover:bg-[#05b34c] text-white rounded-full text-xs px-3.5 flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <LogIn className="w-3.5 h-3.5" />
                {!isLineClient && language === 'th' ? 'เปิดใน LINE' : t('login')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="fixed bottom-0 left-0 z-40 w-full h-16 border-t border-[#d4c3bc]/60 bg-[#f5f0ea]/95 backdrop-blur-lg sm:hidden shadow-lg">
        <div className="grid h-full grid-cols-5 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex flex-col items-center justify-center p-1 transition-all ${
                  isActive ? 'text-[#7a5646] font-semibold' : 'text-[#636260] hover:text-[#1b1c1c]'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-[#7a5646]/10' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] mt-0.5 truncate max-w-[56px] text-center leading-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Customer First-Time Login Onboarding Modal */}
      <CustomerOnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      <Toaster />
    </div>
  );
}
