// src/app/siparis-onay/[id]/page.tsx

import OrderConfirmationClient from "./OrderConfirmationClient";

// Vercel build ortamının ısrarla beklediği Promise tipine geri dönüyoruz.
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>; // Tip tanımını Vercel'in istediği Promise olarak güncelledik
}) {
  // params bir Promise olduğu için "await" ile içindeki değeri çözüyoruz.
  const { id } = await params;

  // Client Component'i, çözülen id ile render ediyoruz.
  return <OrderConfirmationClient orderId={id} />;
}