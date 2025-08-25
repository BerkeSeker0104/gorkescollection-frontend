'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserDto, LoginData } from '@/types';
import { loginUser } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
    "exp": number;
}

interface AuthContextType {
  user: UserDto | null;
  isAdmin: boolean;
  token: string | null;
  // GÜNCELLENDİ: login fonksiyonu artık bir string (hata mesajı) veya undefined dönebilir.
  login: (data: LoginData) => Promise<string | undefined>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        
        if (decodedToken.exp * 1000 > Date.now()) {
          const roleClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
          
          setIsAdmin(roles.includes('Admin'));
          setToken(storedToken);

          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          logout();
        }
      } else {
        setIsAdmin(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Token okunurken hata:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (userData: UserDto) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(userData.token);
    
    try {
      const decodedToken: DecodedToken = jwtDecode(userData.token);
      const roleClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
      setIsAdmin(roles.includes('Admin'));
    } catch (e) {
      setIsAdmin(false);
    }
    
    router.push('/hesabim');
  };

  // GÜNCELLENDİ: login fonksiyonu artık alert göstermek yerine hata mesajını geri döndürüyor.
  const login = async (data: LoginData) => {
    try {
      const result = await loginUser(data); 
      if (result.user) {
        handleAuthSuccess(result.user);
        return undefined; // Başarılı durumda bir şey döndürme
      } else {
        // Hata durumunda, hata mesajını LoginPage'in yakalaması için return et.
        return result.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      }
    } catch (err: any) {
        console.error("Login context error:", err);
        return err.message || "Beklenmedik bir hata oluştu.";
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setIsAdmin(false);
    setToken(null);
    
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}