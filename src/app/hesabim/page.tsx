'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Package, User as UserIcon, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import AddressManager from '@/components/account/AddressManager';
import ProfileInfo from '@/components/account/ProfileInfo';
import OrderList from '@/components/account/OrderList';

export default function AccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

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
    { id: 'profile', label: 'Profil Bilgileri', icon: UserIcon },
    { id: 'addresses', label: 'Adreslerim', icon: MapPin },
    { id: 'orders', label: 'Siparişlerim', icon: Package },
  ] as const;

  const capitalizedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);

  return (
    <div className="bg-[#FAF7F5] min-h-screen pt-40 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-zinc-800">Hoş Geldin, {capitalizedUsername}!</h1>
          <p className="mt-2 text-lg text-zinc-600">Hesap bilgilerini ve sipariş geçmişini buradan yönetebilirsin.</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={clsx(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors",
                    activeTab === item.id ? 'bg-[#2a2a2a] text-white' : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  )}
                >
                  <item.icon className={clsx("mr-3 h-5 w-5 flex-shrink-0", activeTab === item.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-500')} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
              <button
                onClick={logout}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-500" />
                <span className="truncate">Çıkış Yap</span>
              </button>
            </nav>
          </aside>

          <div className="lg:col-span-9 mt-12 lg:mt-0">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md relative z-50">
              <h2 className="text-2xl font-semibold text-zinc-800 mb-6">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              {activeTab === 'profile' && <ProfileInfo />}
              {activeTab === 'addresses' && <AddressManager />}
              {activeTab === 'orders' && <OrderList />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
