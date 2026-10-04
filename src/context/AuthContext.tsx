import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canAccessAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
  fetchAllProfiles: () => Promise<UserProfile[]>;
  updateUserRole: (targetUserId: string, newRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  enablePreviewAdminRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'zad_mock_user';
const LOCAL_PROFILE_KEY = 'zad_mock_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create profile from Supabase
  const fetchProfile = async (userId: string, userMeta?: any) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile does not exist yet, create one
        const newProfile: UserProfile = {
          id: userId,
          full_name: userMeta?.full_name || 'مستخدم زاد',
          avatar_url: userMeta?.avatar_url || null,
          role: 'user',
        };
        const { data: created } = await supabase.from('profiles').insert(newProfile).select().single();
        return created || newProfile;
      }
      return data as UserProfile;
    } catch (e) {
      console.warn('Error fetching Supabase profile:', e);
      return null;
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.user_metadata).then((prof) => {
            setProfile(prof || {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'الداعية',
              role: 'user',
            });
            setLoading(false);
          });
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      // 2. Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id, session.user.user_metadata);
          setProfile(prof || {
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'الداعية',
            role: 'user',
          });
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Local fallback for guest / demo state
      try {
        const savedUser = localStorage.getItem(LOCAL_USER_KEY);
        const savedProf = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (savedUser && savedProf) {
          setUser(JSON.parse(savedUser));
          setProfile(JSON.parse(savedProf));
        }
      } catch (e) {}
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };
        if (data.user) {
          setUser(data.user);
          const prof = await fetchProfile(data.user.id, data.user.user_metadata);
          setProfile(prof);
        }
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    } else {
      // Local demo sign in when Supabase env variables are pending
      const mockUser = {
        id: 'guest-demo-user',
        email,
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: UserProfile = {
        id: 'guest-demo-user',
        full_name: email.split('@')[0] || 'مستخدم تجريبي',
        role: 'user',
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(mockProfile));
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) return { error };
        if (data.user) {
          setUser(data.user);
          const prof = await fetchProfile(data.user.id, { full_name: fullName });
          setProfile(prof || { id: data.user.id, full_name: fullName, role: 'user' });
        }
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    } else {
      const mockUser = {
        id: 'guest-demo-user',
        email,
        app_metadata: {},
        user_metadata: { full_name: fullName },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: UserProfile = {
        id: 'guest-demo-user',
        full_name: fullName || 'الداعية',
        role: 'user',
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(mockProfile));
      return { error: null };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    }
    return { error: null };
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }): Promise<{ error: Error | null }> => {
    if (!profile) return { error: new Error('المستخدم غير مسجل') };

    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      return { error };
    } else {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
      return { error: null };
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin';
  const canAccessAdmin = Boolean(user && (isAdmin || isEditor));

  const fetchAllProfiles = async (): Promise<UserProfile[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as UserProfile[];
        }
      } catch (e) {
        console.warn('Failed to fetch profiles from Supabase', e);
      }
    }
    if (profile) return [profile];
    return [];
  };

  const updateUserRole = async (targetUserId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'غير مصرح لك بتعديل أدوار المستخدمين. هذه الصلاحية للمدير فقط.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Prevent Admin Lockout: If changing an admin to another role, check if there is at least one other admin
        if (newRole !== 'admin') {
          const { data: adminList } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');
          
          if (adminList && adminList.some((a) => a.id === targetUserId) && adminList.length <= 1) {
            return {
              success: false,
              error: 'لا يمكن تجريد آخر مدير في المنصة من صلاحياته لضمان عدم إغلاق لوحة التحكم.',
            };
          }
        }

        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', targetUserId);

        if (error) {
          return { success: false, error: error.message };
        }

        if (targetUserId === profile?.id) {
          setProfile((prev) => (prev ? { ...prev, role: newRole } : null));
        }

        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || 'تعذر تحديث الدور' };
      }
    }

    return { success: true };
  };

  const enablePreviewAdminRole = async (): Promise<void> => {
    if (!user) {
      const demoUser = {
        id: 'admin-preview-user',
        email: 'admin@zad-aldaiah.org',
        app_metadata: {},
        user_metadata: { full_name: 'مدير المنصة' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;
      const demoProfile: UserProfile = {
        id: 'admin-preview-user',
        full_name: 'مدير المنصة التجريبي',
        role: 'admin',
      };
      setUser(demoUser);
      setProfile(demoProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(demoProfile));
      return;
    }

    const updated: UserProfile = profile
      ? { ...profile, role: 'admin' }
      : { id: user.id, full_name: 'مدير المنصة', role: 'admin' };

    setProfile(updated);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      } catch (e) {
        console.warn('Failed to update role in Supabase:', e);
      }
    }
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        isAdmin,
        isEditor,
        canAccessAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        fetchAllProfiles,
        updateUserRole,
        enablePreviewAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
