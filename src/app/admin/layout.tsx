'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
// GÜNCELLENDİ: useState ve Menu ikonu import edildi
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Home, Package, Layers, ShoppingCart, Settings, Ticket, LogOut, Menu } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Ana Panel', icon: Home },
  { href: '/admin/urunler', label: 'Ürünler', icon: Package },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: Layers },
  { href: '/admin/siparisler', label: 'Siparişler', icon: ShoppingCart },
  { href: '/admin/kuponlar', label: 'Kuponlar', icon: Ticket },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // YENİ: Mobil menünün açık/kapalı durumunu tutmak için state eklendi
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);
  
  // YENİ: Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !isAdmin) {
    return <div className="pt-40 text-center">Yönlendiriliyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* YENİ: Mobil için Menü Butonu (Hamburger İkonu) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 fixed top-20 left-0 right-0 h-16 px-4 z-20">
         <span className="text-lg font-semibold text-gray-800">Admin Paneli</span>
         <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu size={24} />
         </button>
      </div>

      <div className="flex">
        {/* YENİ: Menü açıkken içeriği karartan ve tıklayınca menüyü kapatan overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* GÜNCELLENDİ: Sol Taraf: Yan Menü (Sidebar) */}
        <aside className={`w-64 bg-white border-r border-gray-200 fixed top-20 left-0 h-[calc(100vh-80px)] p-4 flex flex-col justify-between
                           transition-transform duration-300 ease-in-out z-40
                           md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <div className="border-t pt-4">
               <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{user?.username}</span>
               </div>
               <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
            </div>
          </div>
        </aside>

        {/* GÜNCELLENDİ: Sağ Taraf: Ana İçerik */}
        <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}