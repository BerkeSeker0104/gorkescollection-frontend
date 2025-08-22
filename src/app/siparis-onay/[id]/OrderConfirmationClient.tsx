// src/app/siparis-onay/[id]/OrderConfirmationClient.tsx

'use client'; // <-- Bu direktif component'in client-side olduğunu belirtir

import { useCart } from "@/context/CartContext";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function OrderConfirmationClient({ orderId }: { orderId: string }) {
  const { refreshCart } = useCart();

  // Bu component yüklendiğinde sepeti yenilemek için useEffect kullanıyoruz.
  useEffect(() => {
    console.log("Sipariş onay sayfası yüklendi, sepet temizleniyor...");
    refreshCart();
  }, [refreshCart]); // Bağımlılık olarak refreshCart eklenir

  return (
    <div className="bg-white pt-40">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Teşekkür Ederiz!</h1>
        <p className="text-gray-600 mt-4">
          Siparişiniz başarıyla oluşturuldu.
        </p>
        <p className="text-gray-800 mt-2 font-semibold">
          Sipariş Numaranız: #{orderId}
        </p>
        <p className="text-gray-600 mt-2">
          Ödemeniz onaylandığında ve siparişiniz kargoya verildiğinde size e-posta ile
          bilgi vereceğiz.
        </p>
      </div>
    </div>
  );
}