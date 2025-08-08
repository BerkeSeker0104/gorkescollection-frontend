import AccordionItem from "@/components/AccordionItem";

const faqData = [
    {
        question: "Siparişim ne zaman kargoya verilir?",
        answer: "<p>Siparişleriniz, sipariş tarihinden itibaren 1-3 iş günü içerisinde hazırlanarak kargoya teslim edilir. Kargo firmasının yoğunluğuna bağlı olarak teslimat süresi değişebilmektedir.</p>"
    },
    {
        question: "Takılarınız kararma yapar mı?",
        answer: "<p>Hayır. Tüm ürünlerimiz, kararmaya, paslanmaya ve suya karşı dayanıklı olan en yüksek kalitede 316L paslanmaz çelikten üretilmektedir. Günlük kullanımda gönül rahatlığıyla kullanabilirsiniz.</p>"
    },
    {
        question: "Hangi kargo firması ile çalışıyorsunuz?",
        answer: "<p>Siparişlerinizi Yurtiçi Kargo ve Kolay Gelsin güvencesiyle adresinize teslim ediyoruz.</p>"
    },
    {
        question: "İade ve değişim politikanız nedir?",
        answer: "<p>Kullanılmamış ve orijinal ambalajı bozulmamış ürünlerinizi, teslim tarihinden itibaren 14 gün içerisinde iade edebilir veya değiştirebilirsiniz. Detaylı bilgi için 'Kargo ve İade' sayfamızı ziyaret edebilirsiniz.</p><p>Hijyen sebebiyle küpe kategorisindeki ürünlerde iade veya değişim yapılamamaktadır.</p>"
    },
    {
        question: "Kapıda ödeme seçeneğiniz var mı?",
        answer: "<p>Şu an için sadece web sitemiz üzerinden kredi kartı ve banka kartı ile güvenli ödeme kabul etmekteyiz. Kapıda ödeme seçeneğimiz bulunmamaktadır.</p>"
    }
];

export default function FaqPage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    {/* Sayfa Başlığı */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Sıkça Sorulan Sorular
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Aklınıza takılan bir soru mu var? Cevabı burada olabilir.
                        </p>
                    </div>

                    {/* SSS Akordiyon Menüsü */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg">
                        {faqData.map((item, index) => (
                            <AccordionItem key={index} question={item.question}>
                                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
