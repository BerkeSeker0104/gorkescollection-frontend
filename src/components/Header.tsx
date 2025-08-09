'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const { cart } = useCart();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isMinimal = !isHomePage || isScrolled || isHovered;

  useEffect(() => {
    const fetchCategories = async () => {
      const fetched = await getCategories();
      setCategories(fetched);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    if (isHomePage) window.addEventListener('scroll', handleScroll);
    else setIsScrolled(true);
    return () => { if (isHomePage) window.removeEventListener('scroll', handleScroll); };
  }, [isHomePage]);

  const headerClasses = clsx(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
    { 'bg-[#fff9f9] shadow-md': isMinimal, 'bg-transparent': !isMinimal, 'h-[80px]': isMinimal, 'h-[160px]': !isMinimal }
  );

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header
      className={headerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-b from-black/25 to-transparent transition-opacity duration-500 pointer-events-none',
        { 'opacity-100': !isMinimal, 'opacity-0': isMinimal }
      )} />

      <div className="container mx-auto px-4 sm:px-6 h-full relative">
        {/* LOGO */}
        <div className={clsx('absolute top-1/2 transition-all duration-500 ease-in-out', {
          'left-4 sm:left-6 -translate-y-1/2': isMinimal,
          'left-1/2 -translate-x-1/2 -translate-y-[60%]': !isMinimal
        })}>
          <Link href="/" aria-label="Ana sayfa">
            <Image
              src={isMinimal ? '/logo-dark.png' : '/logo-light.png'}
              alt="Gorke's Collection Logo"
              width={isMinimal ? 160 : 420}
              height={isMinimal ? 36 : 100}
              priority
              className="transition-all duration-500"
            />
          </Link>
        </div>

        {/* NAV: Masaüstü */}
        <div className={clsx('absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out', {
          'top-1/2 -translate-y-1/2': isMinimal,
          'top-1/2 translate-y-[80%]': !isMinimal
        })}>
          <div className={clsx('hidden md:flex flex-nowrap items-center space-x-6 whitespace-nowrap transition-colors duration-300', {
            'text-white': !isMinimal,
            'text-gray-800 ml-[200px]': isMinimal
          })}>
            <Link href="/yeni-gelenler" className="hover:opacity-75">Yeni Gelenler</Link>
            {categories.map(c => (
              <Link key={c.id} href={`/${c.slug}`} className="hover:opacity-75">{c.name}</Link>
            ))}
          </div>
        </div>

        {/* Sağ aksiyonlar: Masaüstü (Search yok) */}
        <div className={clsx(
          'absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 items-center space-x-5 transition-opacity duration-500',
          { 'hidden md:flex opacity-100': isMinimal, 'hidden md:flex opacity-0 pointer-events-none': !isMinimal }
        )}>
          {user ? (
            <>
              <Link href="/hesabim" className="hover:opacity-75 text-gray-800" aria-label="Hesabım"><User size={22} /></Link>
              <button onClick={logout} className="hover:opacity-75 text-gray-800" aria-label="Çıkış"><LogOut size={22} /></button>
            </>
          ) : (
            <Link href="/giris" className="text-sm font-medium text-gray-800 hover:underline">Giriş Yap</Link>
          )}
          <Link href="/favoriler" className="hover:opacity-75 text-gray-800" aria-label="Favoriler"><Heart size={22} /></Link>
          <Link href="/sepet" className="relative hover:opacity-75 text-gray-800" aria-label="Sepet">
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobil: hamburger */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 md:hidden">
          <button
            type="button"
            aria-label="Menüyü aç/kapat"
            onClick={() => setMobileOpen(v => !v)}
            className={clsx('p-2 rounded-md transition-colors', isMinimal ? 'text-gray-800' : 'text-white')}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobil panel */}
      <div className={clsx(
        'md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out bg-[#fff9f9] shadow',
        mobileOpen ? 'max-height:max max-h-96 opacity-100' : 'max-h-0 opacity-0'
      )}>
        {/* Kategoriler: yatay kaydırmalı chip’ler */}
<nav className="px-4 py-3 border-b border-gray-200">
  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
    <Link
      href="/yeni-gelenler"
      className={clsx(
        "inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-gray-100",
        pathname === "/yeni-gelenler"
          ? "bg-gray-900 text-white shadow-sm border-transparent"
          : "border-gray-300 text-gray-800"
      )}
    >
      Yeni Gelenler
    </Link>
    {categories.map((c) => {
      const categoryPath = `/${c.slug}`;
      return (
        <Link
          key={c.id}
          href={categoryPath}
          className={clsx(
            "inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-gray-100",
            pathname === categoryPath
              ? "bg-gray-900 text-white shadow-sm border-transparent"
              : "border-gray-300 text-gray-800"
          )}
        >
          {c.name}
        </Link>
      );
    })}
  </div>
</nav>


        {/* Kullanıcı/ikonlar + SEPET vurgulu */}
        <div className="px-4 py-3 flex items-center gap-4">
          {user ? (
            <>
              <Link href="/hesabim" className="text-gray-800 flex items-center" aria-label="Hesabım">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-gray-800 flex items-center" aria-label="Çıkış">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link href="/giris" className="text-gray-800">Giriş Yap</Link>
          )}

          <Link href="/favoriler" className="text-gray-800" aria-label="Favoriler">
            <Heart size={20} />
          </Link>

          {/* Sepet: daha belirgin buton */}
          <div className="ml-auto">
            <Link
              href="/sepet"
              className="relative inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-100"
              aria-label="Sepet"
            >
              <ShoppingBag size={20} />
              <span className="text-sm font-medium">Sepet</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
