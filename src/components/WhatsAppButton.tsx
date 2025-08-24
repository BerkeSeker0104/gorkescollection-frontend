'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Sayfa yolunu almak için

const WhatsAppButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;
  const pathname = usePathname();

  // İkonun gizleneceği sayfaları kontrol et
  const isProductPage = pathname.startsWith('/urun/');
  const isCartPage = pathname.startsWith('/sepet');
  const isCheckoutPage = pathname.startsWith('/odeme');

  // Eğer bu sayfalardan birindeysek, butonu mobil cihazlarda gizle
  // md:fixed -> Sadece medium ve üzeri ekranlarda sabitlenir, mobilde gizlenir
  const visibilityClass = (isProductPage || isCartPage || isCheckoutPage) ? 'hidden md:fixed' : 'fixed';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden iletişime geçin"
      className={`${visibilityClass} bottom-6 right-6 z-50 transition-transform transform hover:scale-110`}
    >
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
