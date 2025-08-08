import { CheckCircle } from "lucide-react";

// --- GÜNCELLENDİ: Tip tanımı sadeleştirildi ---
// Ayrı bir interface oluşturmak yerine, props'ları doğrudan fonksiyonun
// imzasında tanımlamak bu tür hataları çözer.
export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
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
                    Sipariş Numaranız: #{params.id}
                </p>
                <p className="text-gray-600 mt-2">
                    Ödemeniz onaylandığında ve siparişiniz kargoya verildiğinde size e-posta ile bilgi vereceğiz.
                </p>
            </div>
        </div>
    );
}
