// src/app/siparis-onay/[id]/page.tsx

import OrderConfirmationClient from "./OrderConfirmationClient";

// Props'lar için daha standart bir tip tanımı yapıyoruz.
// Bu, Vercel'in derleme motorunun tipleri doğru anlamasını sağlar.
type Props = {
  params: { id: string };
};

// Component'in props'larını bu yeni 'Props' tipini kullanarak tanımlıyoruz.
export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = params;

  // Client Component'i, gerekli prop'ları (orderId) geçirerek render ediyoruz.
  return <OrderConfirmationClient orderId={id} />;
}