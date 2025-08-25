// Dosya: src/app/kargo-takip/page.tsx (YENİ TASARIM)

import LottieTruck from "@/components/LottieTruck"; // Yeni animasyon bileşenimiz
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa"; // WhatsApp ikonu için (npm install react-icons)

export default function KargoTakipPage() {
  const whatsappNumber = "905308331705"; 
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Merhaba, kargo takibi hakkında bilgi almak istiyorum.")}`;

  return (
    <div className="bg-[#FAF7F5] min-h-screen pt-36 sm:pt-40 pb-24 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center bg-white p-8 sm:p-12 rounded-2xl shadow-md">
          
          <LottieTruck />

          <h1 className="text-3xl font-bold text-zinc-800 mt-6">
            Kargo Takibi Yakında Aktif Olacak
          </h1>

          <p className="mt-4 text-zinc-600 max-w-lg mx-auto">
            Bu özellik şu anda geliştirme aşamasındadır. O zamana kadar, siparişinizle birlikte size e-posta veya SMS ile gönderilen kargo takip numarasını kullanarak, ilgili kargo firmasının web sitesi üzerinden gönderinizin durumunu kontrol edebilirsiniz.
          </p>

          <div className="mt-8">
            <Link 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto rounded-lg bg-green-500 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-green-600 transition-colors"
            >
              <FaWhatsapp size={22} />
              <span>Ek Sorularınız İçin Bize Ulaşın</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}