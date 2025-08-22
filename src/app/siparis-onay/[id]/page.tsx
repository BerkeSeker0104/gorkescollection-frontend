// src/app/siparis-onay/[id]/page.tsx

import OrderConfirmationClient from "./OrderConfirmationClient";

// Bu dosya bir Sunucu Bileşeni (Server Component) olarak kalır.
// Yeni görevi, client-side mantığı içeren OrderConfirmationClient'i çağırmak
// ve sunucudan aldığı parametreleri (sipariş id'si gibi) ona aktarmaktır.
export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Client Component'i, gerekli prop'ları (orderId) geçirerek render ediyoruz.
  // Sepeti temizleme gibi tüm client-side işlemler OrderConfirmationClient içinde gerçekleşecek.
  return <OrderConfirmationClient orderId={id} />;
}