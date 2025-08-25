// Dosya: src/components/LottieTruck.tsx (YENİ DOSYA)
'use client';

import Lottie from "lottie-react";
// Bu animasyon dosyasını public klasörünüze eklemeniz gerekecek.
import truckAnimation from "@/../public/truck-animation.json"; 

export default function LottieTruck() {
  return (
    <div className="max-w-xs mx-auto">
      <Lottie animationData={truckAnimation} loop={true} />
    </div>
  );
};