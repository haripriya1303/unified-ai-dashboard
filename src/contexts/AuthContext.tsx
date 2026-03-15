import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '', name: session.user.user_metadata?.name });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '', name: session.user.user_metadata?.name });
        }
        setIsLoading(false);
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    if (data.user) {
      await supabase.from('users').upsert({ id: data.user.id, name, email, updated_at: new Date().toISOString() });
    }
  };

  const loginWithGoogle = async () => {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });
    if (error) throw error;
  };

  const logout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateUserName = (name: string) => {
    setUser(prev => prev ? { ...prev, name } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};
