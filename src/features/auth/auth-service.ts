import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { initializeLiff, getLiffProfile, isLiffConfigured } from '../../lib/liff';
import { useAuthStore } from '../../stores/auth-store';
import type { Profile } from '../../types';

export const DEMO_CUSTOMER: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  line_user_id: 'demo_customer_line_id',
  display_name: 'คุณมินตรา (ลูกค้าคนพิเศษ)',
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

export const authenticateWithLine = async (): Promise<Profile | null> => {
  const { setUser, setLoading, user } = useAuthStore.getState();

  // If already authenticated in store, don't block
  if (user) {
    setLoading(false);
    return user;
  }

  if (!isLiffConfigured) {
    setLoading(false);
    return null;
  }

  setLoading(true);

  try {
    await initializeLiff();
    const lineProfile = await getLiffProfile();

    if (!lineProfile) {
      setLoading(false);
      return null;
    }

    if (!isSupabaseConfigured) {
      const syntheticProfile: Profile = {
        id: lineProfile.userId,
        line_user_id: lineProfile.userId,
        display_name: lineProfile.displayName,
        picture_url: lineProfile.pictureUrl || null,
        phone: null,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(syntheticProfile);
      setLoading(false);
      return syntheticProfile;
    }

    const email = `line_${lineProfile.userId}@kiki.line.local`;
    const password = `kiki_${lineProfile.userId}_secure`;

    let authedUserId: string | null = null;

    const signInRes = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInRes.data?.user) {
      authedUserId = signInRes.data.user.id;
    } else {
      const signUpRes = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpRes.error) throw signUpRes.error;
      if (signUpRes.data?.user) {
        authedUserId = signUpRes.data.user.id;
        await (supabase.from('profiles') as unknown as { insert: (row: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({
          id: authedUserId,
          line_user_id: lineProfile.userId,
          display_name: lineProfile.displayName,
          picture_url: lineProfile.pictureUrl || null,
          role: 'customer',
        });
      }
    }

    if (authedUserId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authedUserId)
        .single();

      if (profile) {
        const typedProfile = profile as unknown as Profile;
        await (supabase.from('profiles') as unknown as { update: (row: Record<string, unknown>) => { eq: (f: string, v: string) => Promise<unknown> } })
          .update({
            display_name: lineProfile.displayName,
            picture_url: lineProfile.pictureUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authedUserId);

        typedProfile.display_name = lineProfile.displayName;
        typedProfile.picture_url = lineProfile.pictureUrl || null;
        setUser(typedProfile);
        return typedProfile;
      }
    }

    setLoading(false);
    return null;
  } catch (error) {
    console.warn('Authentication with LINE/Supabase error, continuing:', error);
    setLoading(false);
    return null;
  }
};

export const loginAsDemo = async (role: 'customer' | 'admin'): Promise<Profile | null> => {
  const { setUser, setLoading } = useAuthStore.getState();
  setLoading(true);

  // If Supabase is configured, attempt real auth
  if (isSupabaseConfigured) {
    try {
      const email = `demo_${role}@kiki.line.local`;
      const password = `kiki_demo_${role}_secure`;

      let authedUserId: string | null = null;
      const signInRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInRes.data?.user) {
        authedUserId = signInRes.data.user.id;
      } else {
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpRes.data?.user) {
          authedUserId = signUpRes.data.user.id;
          await (supabase.from('profiles') as unknown as { insert: (row: Record<string, unknown>) => Promise<{ error: unknown }> }).insert({
            id: authedUserId,
            line_user_id: `demo_${role}`,
            display_name: role === 'admin' ? 'ผู้จัดการร้าน KIKI' : 'คุณมินตรา (ลูกค้าคนพิเศษ)',
            picture_url: null,
            role,
          });
        }
      }

      if (authedUserId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authedUserId)
          .single();

        if (profile) {
          const typedProfile = profile as unknown as Profile;
          setUser(typedProfile);
          return typedProfile;
        }
      }
    } catch (e) {
      console.warn('Supabase demo login error, falling back to local demo profile:', e);
    }
  }

  // Graceful fallback to local demo profile
  const mockProfile = role === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
  setUser(mockProfile);
  setLoading(false);
  return mockProfile;
};
