'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Sayfa yolunu almak için gerekli hook

const WhatsAppButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;
  const pathname = usePathname(); // Mevcut sayfanın URL yolunu alır (örn: "/urun/123")

  // Mevcut sayfanın bir ürün sayfası olup olmadığını kontrol et
  const isProductPage = pathname.startsWith('/urun/');

  // Ürün sayfasındaysak ikonun alttan mesafesini artır, değilse varsayılan mesafede kalsın.
  // 'bottom-[95px]' değeri, "Sepete Ekle" barının yüksekliğine göre ayarlanmıştır.
  const positionClass = isProductPage ? 'bottom-[95px]' : 'bottom-6';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden iletişime geçin"
      // `positionClass` değişkenini ve geçiş efekti için `transition-all`'u ekliyoruz
      className={`fixed ${positionClass} right-6 z-50 transition-all duration-300 transform hover:scale-110`}
    >
      {/* İkonun daha görünür olması için boyutu büyütüp gölge ekliyoruz */}
      <Image
        src="/whatsapp.png"
        alt="WhatsApp İletişim"
        width={32}
        height={32}
      />
    </a>
  );
};

export default WhatsAppButton;
