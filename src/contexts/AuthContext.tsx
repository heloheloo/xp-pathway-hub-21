
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'student' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
  groupId?: string;
  groupName?: string;
  xp?: number;
  level?: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// UI-only superadmin credentials
const SUPERADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'demo123'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          groups(name)
        `)
        .eq('user_id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: profile.id,
        username: profile.username,
        role: profile.role as UserRole,
        email: profile.email || supabaseUser.email,
        groupId: profile.group_id,
        groupName: profile.groups?.name,
        xp: profile.xp,
        level: profile.level
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Handle UI-only superadmin login
      if (role === 'superadmin') {
        if (username === SUPERADMIN_CREDENTIALS.username && password === SUPERADMIN_CREDENTIALS.password) {
          // Create a mock user object for superadmin
          const superadminUser: User = {
            id: 'superadmin-ui-only',
            username: 'superadmin',
            role: 'superadmin',
            email: 'superadmin@example.com',
            xp: 0,
            level: 1
          };
          setUser(superadminUser);
          return true;
        }
        return false;
      }

      // Handle regular admin/student login through database
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .eq('role', role)
        .single();

      if (!profile?.email) {
        return false;
      }

      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        setUser(userProfile);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    // For UI-only superadmin, just clear the state
    if (user?.id === 'superadmin-ui-only') {
      setUser(null);
      return;
    }
    
    // For regular users, sign out from Supabase
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = !!user && !loading;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
