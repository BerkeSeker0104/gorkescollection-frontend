'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Package, User as UserIcon, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import AddressManager from '@/components/account/AddressManager';
import ProfileInfo from '@/components/account/ProfileInfo';
import OrderList from '@/components/account/OrderList';

// Yeni type tanımı
type TabId = 'profile' | 'addresses' | 'orders';

export default function AccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  // Başlangıçta hiçbir tab aktif olmayacak
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  if (authLoading) return <div className="text-center pt-48">Yükleniyor...</div>;

  if (!user) {
    return (
      <div className="text-center pt-48">
        <p>Bu sayfayı görüntülemek için lütfen giriş yapın.</p>
        <Link href="/giris" className="text-[#A58E74] hover:underline mt-2 inline-block">Giriş Yap</Link>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'Profil Bilgileri', description: 'Kişisel bilgilerinizi ve parolanızı güncelleyin.', icon: UserIcon },
    { id: 'addresses', label: 'Adreslerim', description: 'Teslimat adreslerinizi yönetin.', icon: MapPin },
    { id: 'orders', label: 'Siparişlerim', description: 'Sipariş geçmişinizi ve kargo durumunu görüntüleyin.', icon: Package },
  ] as const;

  const displayName = user.firstName || user.username;
  const capitalizedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo />;
      case 'addresses':
        return <AddressManager />;
      case 'orders':
        return <OrderList />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#FAF7F5] min-h-screen pt-32 sm:pt-40 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-800">Hoş Geldin, {capitalizedDisplayName}!</h1>
          <p className="mt-2 text-lg text-zinc-600">Hesabınızı buradan yönetebilirsiniz.</p>
        </div>

        {/* --- YENİ KART TABANLI MENÜ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "group bg-white p-6 rounded-xl shadow-sm text-left w-full transition-all duration-300 ease-in-out border-2",
                activeTab === item.id 
                  ? 'border-[#2a2a2a] ring-2 ring-[#2a2a2a] ring-offset-2' 
                  : 'border-transparent hover:shadow-md hover:border-zinc-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <item.icon className="h-8 w-8 text-zinc-500 transition-colors group-hover:text-[#A58E74]" />
                  <span className="ml-4 text-lg font-semibold text-zinc-800">{item.label}</span>
                </div>
                <ChevronRight className="h-6 w-6 text-zinc-400 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-zinc-600">{item.description}</p>
            </button>
          ))}
        </div>

        {/* --- SEÇİLEN İÇERİĞİN GÖSTERİLDİĞİ ALAN --- */}
        {activeTab && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-semibold text-zinc-800">
                  {menuItems.find(m => m.id === activeTab)?.label}
               </h2>
               {/* Aktif tabı kapatmak için "kapat" butonu */}
               <button onClick={() => setActiveTab(null)} className="text-sm text-zinc-500 hover:text-zinc-800">
                 Kapat
               </button>
            </div>
            {renderContent()}
          </div>
        )}
        
        {/* Çıkış Yap Butonu (her zaman görünür) */}
        <div className="mt-12 text-center">
            <button
                onClick={logout}
                className="group flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-medium rounded-md text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
              >
                <LogOut className="h-5 w-5 text-zinc-400 group-hover:text-zinc-500" />
                <span>Çıkış Yap</span>
            </button>
        </div>

      </div>
    </div>
  );
}