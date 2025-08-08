'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getCategories } from '@/lib/api'; // Merkezi API fonksiyonumuzu kullanacağız
import { Category } from '@/types';     // Category tipini import ediyoruz

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const { cart } = useCart();
  const { user, logout } = useAuth();
  
  // --- YENİ BÖLÜM: Kategorileri tutmak için state ---
  const [categories, setCategories] = useState<Category[]>([]);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isMinimal = !isHomePage || isScrolled || isHovered;

  // --- YENİ BÖLÜM: Bileşen ilk yüklendiğinde kategorileri çek ---
  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []); // Boş dependency array, bu effect'in sadece bir kez çalışmasını sağlar.

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true);
    }

    return () => {
      if (isHomePage) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isHomePage]);

  const headerClasses = clsx(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
    {
      'bg-[#fff9f9] shadow-md': isMinimal,
      'bg-transparent': !isMinimal,
      'h-[80px]': isMinimal,
      'h-[160px]': !isMinimal,
    }
  );

  return (
    <header
      className={headerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={clsx("absolute inset-0 bg-gradient-to-b from-black/25 to-transparent transition-opacity duration-500 pointer-events-none", {
        'opacity-100': !isMinimal,
        'opacity-0': isMinimal
      })}></div>

      <div className="container mx-auto px-6 h-full relative">
        <div className={clsx("absolute top-1/2 transition-all duration-500 ease-in-out", {
            'left-6 -translate-y-1/2': isMinimal,
            'left-1/2 -translate-x-1/2 -translate-y-[60%]': !isMinimal
        })}>
            <Link href="/">
                <Image
                    src={isMinimal ? "/logo-dark.png" : "/logo-light.png"}
                    alt="Gorke's Collection Logo"
                    width={isMinimal ? 180 : 420}
                    height={isMinimal ? 40 : 100}
                    priority
                    className="transition-all duration-500"
                />
            </Link>
        </div>

        <div className={clsx("absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out", {
          'top-1/2 -translate-y-1/2': isMinimal,
          'top-1/2 translate-y-[80%]': !isMinimal,
        })}>
          <div className={clsx("hidden md:flex flex-nowrap items-center space-x-6 whitespace-nowrap transition-colors duration-300", {
            'text-white': !isMinimal,
            'text-gray-800 ml-[240px]': isMinimal,
          })}>
            <Link href="/yeni-gelenler" className="hover:opacity-75">Yeni Gelenler</Link>
            
            {/* --- DİNAMİK KATEGORİ LİNKLERİ --- */}
            {categories.map(category => (
                <Link key={category.id} href={`/${category.slug}`} className="hover:opacity-75">
                    {category.name}
                </Link>
            ))}
          </div>
        </div>

        <div className={clsx("absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-5 transition-opacity duration-500", {
          'opacity-100': isMinimal,
          'opacity-0 pointer-events-none': !isMinimal,
        })}>
          <button className="hover:opacity-75 text-gray-800"><Search size={22} /></button>
          
          {user ? (
            <>
              <Link href="/hesabim" className="hover:opacity-75 text-gray-800"><User size={22} /></Link>
              <button onClick={logout} className="hover:opacity-75 text-gray-800"><LogOut size={22} /></button>
            </>
          ) : (
            <Link href="/giris" className="text-sm font-medium text-gray-800 hover:underline">Giriş Yap</Link>
          )}

          <Link href="/favoriler" className="hover:opacity-75 text-gray-800"><Heart size={22} /></Link>
          <Link href="/sepet" className="relative hover:opacity-75 text-gray-800">
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
