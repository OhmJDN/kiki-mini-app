import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { initializeLiff, getLiffProfile, isLiffConfigured, isInLineApp } from '../../lib/liff';
import { useAuthStore } from '../../stores/auth-store';
import type { Profile } from '../../types';

export const DEMO_CUSTOMER: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  line_user_id: 'demo_customer_line_id',
  display_name: 'ลูกค้า KIKI (Guest)',
  picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '081-234-5678',
  role: 'customer',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_ADMIN: Profile = {
  id: '00000000-0000-0000-0000-000000000002',
  line_user_id: 'demo_admin_line_id',
  display_name: 'ผู้จัดการร้าน KIKI',
  picture_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  phone: '089-876-5432',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const authenticateWithLine = async (force: boolean = false): Promise<Profile | null> => {
  const { setUser, setLoading, user } = useAuthStore.getState();

  const isDemo = !user || user.line_user_id?.startsWith('demo_') || user.display_name?.includes('มินตรา');
  const inLine = isInLineApp();

  // If already authenticated with a real LINE ID and not in LINE refresh/force
  if (user && !isDemo && !force && !inLine) {
    setLoading(false);
    return user;
  }

  if (!isLiffConfigured) {
    setLoading(false);
    return isDemo ? null : user;
  }

  setLoading(true);

  try {
    await initializeLiff();
    const lineProfile = await getLiffProfile();

    if (!lineProfile) {
      setLoading(false);
      // If we couldn't get LINE profile (e.g. desktop external browser), keep existing or null
      return user;
    }

    let realProfile: Profile = {
      id: lineProfile.userId,
      line_user_id: lineProfile.userId,
      display_name: lineProfile.displayName,
      picture_url: lineProfile.pictureUrl || null,
      phone: user?.phone || null,
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data: existingProfile } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('line_user_id', lineProfile.userId)
          .maybeSingle();

        if (existingProfile) {
          await (supabase.from('profiles') as any)
            .update({
              display_name: lineProfile.displayName,
              picture_url: lineProfile.pictureUrl || existingProfile.picture_url,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProfile.id);

          realProfile = {
            ...existingProfile,
            display_name: lineProfile.displayName,
            picture_url: lineProfile.pictureUrl || existingProfile.picture_url,
          };
        } else {
          const { data: newProfile, error: insErr } = await (supabase.from('profiles') as any)
            .insert({
              line_user_id: lineProfile.userId,
              display_name: lineProfile.displayName,
              picture_url: lineProfile.pictureUrl || null,
              role: 'customer',
            })
            .select()
            .single();

          if (!insErr && newProfile) {
            realProfile = newProfile as Profile;
          }
        }
      } catch (e) {
        console.warn('Supabase profile sync error, fallback to realProfile:', e);
      }
    }

    setUser(realProfile);
    setLoading(false);
    return realProfile;
  } catch (error) {
    console.warn('Authentication with LINE/Supabase error, continuing:', error);
    setLoading(false);
    return null;
  }
};

export const loginAsDemo = async (role: 'customer' | 'admin'): Promise<Profile | null> => {
  const { setUser, setLoading } = useAuthStore.getState();
  setLoading(true);

  if (isSupabaseConfigured) {
    try {
      const demoLineId = `demo_${role}_line_id`;
      const { data: existingProfile } = await (supabase.from('profiles') as any)
        .select('*')
        .eq('line_user_id', demoLineId)
        .maybeSingle();

      if (existingProfile) {
        setUser(existingProfile as Profile);
        setLoading(false);
        return existingProfile as Profile;
      } else {
        const { data: newProfile } = await (supabase.from('profiles') as any)
          .insert({
            line_user_id: demoLineId,
            display_name: role === 'admin' ? 'ผู้จัดการร้าน KIKI' : 'ลูกค้า KIKI (Guest)',
            picture_url: role === 'admin' 
              ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' 
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            phone: role === 'admin' ? '089-876-5432' : '081-234-5678',
            role,
          })
          .select()
          .single();

        if (newProfile) {
          setUser(newProfile as Profile);
          setLoading(false);
          return newProfile as Profile;
        }
      }
    } catch (e) {
      console.warn('Supabase demo sync error, using local demo profile:', e);
    }
  }

  // Fallback to local demo profile
  const mockProfile = role === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
  setUser(mockProfile);
  setLoading(false);
  return mockProfile;
};
