'use client';

import React from 'react';

const WhatsAppButton = ({ phoneNumber }: { phoneNumber: string }) => {
  // WhatsApp'ın "click to chat" özelliği için URL oluşturma
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden iletişime geçin"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110"
    >
      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="w-8 h-8"
        fill="currentColor"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 221.9-99.6 221.9-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-10.8-94-31.4l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-22.5-35.8-34.5-77.4-34.5-120.8 0-106.9 87.1-194 194-194 52.4 0 101.4 20.6 137.2 56.4 35.8 35.8 56.4 84.8 56.4 137.2 0 106.9-87.1 194-194 194zM223.9 150c-13.3 0-24.1 10.8-24.1 24.1v77.5c0 13.3 10.8 24.1 24.1 24.1h.1c13.3 0 24.1-10.8 24.1-24.1v-77.5c0-13.3-10.8-24.1-24.1-24.1zM223.9 334.6c-13.3 0-24.1 10.8-24.1 24.1s10.8 24.1 24.1 24.1 24.1-10.8 24.1-24.1-10.8-24.1-24.1-24.1zM128.4 198.8c-13.3 0-24.1 10.8-24.1 24.1v77.5c0 13.3 10.8 24.1 24.1 24.1s24.1-10.8 24.1-24.1v-77.5c0-13.3-10.8-24.1-24.1-24.1zm191.1 0c-13.3 0-24.1 10.8-24.1 24.1v77.5c0 13.3 10.8 24.1 24.1 24.1s24.1-10.8 24.1-24.1v-77.5c0-13.3-10.8-24.1-24.1-24.1z"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;
