'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserDto, LoginData } from '@/types'; // RegisterData kaldırıldı
import Cookies from 'js-cookie';
import { loginUser } from '@/lib/api'; // registerUser kaldırıldı
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Token'ın içindeki verinin yapısını tanımlıyoruz.
interface DecodedToken {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
}

interface AuthContextType {
  user: UserDto | null;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  // register fonksiyonu kaldırıldı
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserFromToken = () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        
        const roleClaim = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        
        setIsAdmin(roles.includes('Admin'));

        const userCookie = Cookies.get('user');
        if (userCookie) {
          setUser(JSON.parse(userCookie));
        }
      } else {
        setIsAdmin(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Token okunurken hata:", error);
      logout();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const handleAuthSuccess = (userData: UserDto) => {
    setUser(userData);
    Cookies.set('token', userData.token, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set('user', JSON.stringify(userData), { expires: 7, secure: true, sameSite: 'strict' });
    loadUserFromToken();
    router.push('/hesabim');
  };

  // --- GÜNCELLENDİ: login fonksiyonu ---
  const login = async (data: LoginData) => {
    // loginUser artık { user, error } nesnesi döndürüyor.
    const result = await loginUser(data); 

    if (result.user) {
      // Başarılı olursa, sadece user nesnesini gönderiyoruz.
      handleAuthSuccess(result.user);
    } else {
      // Başarısız olursa, backend'den gelen hatayı gösteriyoruz.
      alert(result.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  // --- SİLİNDİ: register fonksiyonu artık burada değil ---
  // Kayıt işlemi artık kendi sayfasında yönetiliyor ve
  // başarılı olunca kullanıcıyı bilgilendiriyor, giriş yaptırmıyor.

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  return (
    // register buradan kaldırıldı
    <AuthContext.Provider value={{ user, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
