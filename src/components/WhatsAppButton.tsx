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
      // Arka plan, boyut ve gölge gibi stiller kaldırıldı
      className="fixed bottom-6 right-6 z-50 transition-transform transform hover:scale-110"
    >
      {/* --- DEĞİŞİKLİK BURADA --- */}
      {/* Arka plan kaldırıldı, boyut ve gölge doğrudan resme verildi */}
      <Image
        src="/whatsapp.png" // Dosya adı güncellendi
        alt="WhatsApp İletişim"
        width={32} // İkonun genişliği artırıldı (eski buton boyutu)
        height={32} // İkonun yüksekliği artırıldı (eski buton boyutu)
      />
    </a>
  );
};

export default WhatsAppButton;
