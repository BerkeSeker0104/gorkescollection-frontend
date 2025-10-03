import { Truck, Undo2 } from 'lucide-react';

export default function ShippingAndReturnsPage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Sayfa Başlığı */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Kargo ve İade
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Siparişleriniz ve iade süreçleriniz hakkında bilmeniz gereken her şey.
                        </p>
                    </div>

                    {/* Ana İçerik Alanı */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg space-y-12">
                        {/* Kargo Bölümü */}
                        <div id="kargo">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <Truck size={28} className="text-gray-700" />
                                </div>
                                <h2 className="text-3xl font-semibold text-gray-800">Kargo Süreçleri</h2>
                            </div>
                            {/* DEĞİŞİKLİK: Metinlerin daha ferah görünmesi için stil güncellemeleri */}
                            <div className="prose max-w-none text-gray-600 leading-relaxed space-y-4">
                                <h4>Teslimat Süresi</h4>
                                <p>
                                    Standart teslimat süremiz, siparişinizin onaylanmasını takiben <strong>1-3 iş günüdür</strong>. Siparişiniz kargoya verildiğinde, size kargo takip numaranızı içeren bir bilgilendirme e-postası gönderilecektir. Bu numara ile kargonuzun durumunu anlık olarak takip edebilirsiniz.
                                </p>
                                <h4>Kargo Ücreti</h4>
                                <p>
                                    Türkiye'nin her yerine sabit kargo ücretimiz <strong>69.90 TL</strong>'dir. <strong>500 TL ve üzeri</strong> tüm alışverişlerinizde kargo ücretsizdir.
                                </p>
                                <h4>Anlaşmalı Kargo Firmaları</h4>
                                <p>
                                    Siparişlerinizi, Türkiye'nin en güvenilir kargo firmalarından olan <strong>Aras Kargo</strong>, <strong>PTT Kargo</strong> ve <strong>Sürat Kargo</strong> ile gönderiyoruz.
                                </p>
                            </div>
                        </div>

                        {/* Ayırıcı Çizgi */}
                        <div className="border-t border-gray-200"></div>

                        {/* İade & Değişim Bölümü */}
                        <div id="iade">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <Undo2 size={28} className="text-gray-700" />
                                </div>
                                <h2 className="text-3xl font-semibold text-gray-800">İade & Değişim Şartları</h2>
                            </div>
                             {/* DEĞİŞİKLİK: Metinlerin daha ferah görünmesi için stil güncellemeleri */}
                             <div className="prose max-w-none text-gray-600 leading-relaxed space-y-4">
                                <h4>İade Süresi</h4>
                                <p>
                                    Satın aldığınız üründen memnun kalmamanız durumunda, ürünün size teslim edildiği tarihten itibaren <strong>14 gün</strong> içerisinde iade talebinde bulunabilirsiniz.
                                </p>
                                <h4>İade Koşulları</h4>
                                <ul className="space-y-2">
                                    <li>İade edilecek ürünlerin kesinlikle kullanılmamış, yıpranmamış ve orijinal ambalajı ile birlikte gönderilmesi gerekmektedir.</li>
                                    <li>Hijyenik nedenlerden dolayı, <strong>küpe kategorisindeki ürünlerde iade veya değişim yapılamamaktadır.</strong></li>
                                    <li>İade kargo ücreti müşteriye aittir. Anlaşmalı kargo kodumuz ile indirimli gönderim yapabilirsiniz.</li>
                                </ul>
                                <h4>İade Süreci</h4>
                                <p>
                                    İade talebinizi oluşturmak için "Hesabım" bölümündeki "Siparişlerim" sayfasını ziyaret edebilir veya <code>gorkescollection@gmail.com</code> adresine e-posta gönderebilirsiniz. Talebiniz onaylandıktan sonra, ürünü size ileteceğimiz adrese göndermeniz gerekmektedir. Ürün bize ulaştıktan ve kontrolleri yapıldıktan sonra, ücret iadeniz 3-7 iş günü içerisinde ödeme yaptığınız karta gerçekleştirilecektir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
