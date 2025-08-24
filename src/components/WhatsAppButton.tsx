'use client';

import React from 'react';
import Image from 'next/image'; // Next.js'in Image component'ini import ediyoruz

const WhatsAppButton = ({ phoneNumber }: { phoneNumber: string }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden iletişime geçin"
      className="fixed bottom-6 right-6 z-50 bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110"
    >
      {/* --- DEĞİŞİKLİK BURADA --- */}
      {/* SVG yerine Next.js Image component'ini kullanıyoruz */}
      <Image
        src="/whatsapp.png" // Dosya adı güncellendi
        alt="WhatsApp İletişim"
        width={32} // İkonun genişliği
        height={32} // İkonun yüksekliği
        className="w-8 h-8"
      />
    </a>
  );
};

export default WhatsAppButton;
