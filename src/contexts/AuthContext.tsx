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
    const initAuth = async () => {
      try {
        // 1. Check URL for custom backend JWT (token redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          // Save token to localStorage
          localStorage.setItem('access_token', token);
          
          // Decode JWT (basic base64 decode of payload)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ id: payload.sub, email: payload.email, name: payload.name });
            
            // Remove token from URL for clean history
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
            return; // Skip Supabase init since we are authenticated via custom backend
          } catch (e) {
            console.error("Invalid token format", e);
          }
        }
        
        // 2. Check localStorage for existing custom token
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
              setUser({ id: payload.sub, email: payload.email, name: payload.name });
              setIsLoading(false);
              return;
            } else {
              localStorage.removeItem('access_token');
            }
          } catch (e) {
            localStorage.removeItem('access_token');
          }
        }

        // 3. Fallback to Supabase auth check
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
    window.location.href = "http://localhost:8000/api/auth/google/login";
  };

  const logout = async () => {
    try {
      localStorage.removeItem('access_token');
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
