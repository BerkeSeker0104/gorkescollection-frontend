import { FileText } from 'lucide-react';

export default function DistanceSalesPage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Sayfa Başlığı */}
                    <div className="text-center mb-12">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Mesafeli Satış Sözleşmesi
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Web sitemiz üzerinden yapılan satışlara ilişkin yasal sözleşme.
                        </p>
                    </div>

                    {/* Ana İçerik Alanı */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg">
                        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                            <h3>MADDE 1: TARAFLAR</h3>
                            <p><strong>SATICI:</strong><br/>
                                Unvan: [Şirket Unvanınız]<br/>
                                Adres: [Şirket Adresiniz]<br/>
                                Telefon: [Telefon Numaranız]<br/>
                                E-posta: [E-posta Adresiniz]
                            </p>
                            <p><strong>ALICI:</strong><br/>
                                Adı Soyadı: [Müşteri Adı Soyadı]<br/>
                                Adres: [Teslimat Adresi]<br/>
                                Telefon: [Müşteri Telefonu]<br/>
                                E-posta: [Müşteri E-postası]
                            </p>

                            <h3>MADDE 2: SÖZLEŞMENİN KONUSU</h3>
                            <p>
                                İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.gorkescollection.com internet sitesinden elektronik ortamda siparişini yaptığı, aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicilerin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
                            </p>

                            <h3>MADDE 3: SÖZLEŞME KONUSU ÜRÜN, ÖDEME VE TESLİMAT</h3>
                            <p>
                                Ürünlerin Cinsi ve türü, Miktarı, Marka/Modeli, Rengi, Satış Bedeli sipariş sonu bilgilendirme formunda ve faturada belirtildiği gibidir. Ödeme şekli ve teslimat bilgileri de yine aynı şekilde sipariş özeti ekranında belirtilmiştir.
                            </p>

                            <h3>MADDE 4: CAYMA HAKKI</h3>
                            <p>
                                ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (ondört) gün içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Ancak, hijyenik niteliği sebebiyle küpe gibi ürünlerde ambalajı açılmış, kullanılmış veya hasar görmüş ürünlerin iadesi kabul edilmemektedir. Cayma hakkının kullanılması için bu süre içinde SATICI'ya e-posta veya telefon ile bildirimde bulunulması şarttır.
                            </p>

                            <h3>MADDE 5: GENEL HÜKÜMLER</h3>
                            <p>
                                5.1. ALICI, www.gorkescollection.com internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
                            </p>
                            <p>
                                5.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
                            </p>

                            <h3>MADDE 6: YETKİLİ MAHKEME</h3>
                            <p>
                                İşbu sözleşmenin uygulanmasından doğacak uyuşmazlıklarda, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
