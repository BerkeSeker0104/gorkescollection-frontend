import Image from 'next/image';
import { Gem, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link'; // DÜZELTME: Eksik olan Link bileşenini import ediyoruz.

export default function AboutUsPage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Sayfa Başlığı ve Görsel (Değişiklik yok) */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Bizim Hikayemiz
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Zarafeti ve kaliteyi bir araya getiren tasarımlar.
                        </p>
                    </div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-16 shadow-lg">
                        <Image
                            src="/hakkimizda.jpg"
                            alt="Gorke's Collection Atölye"
                            width={1260}
                            height={750}
                            className="h-full w-full object-cover object-center"
                            priority
                        />
                    </div>

                    {/* --- YENİ TASARIM: İçerik Bölümü --- */}
                    <div className="space-y-16">
                        {/* Vizyonumuz Bölümü */}
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-shrink-0 bg-white p-6 rounded-full shadow-md">
                                <Gem size={40} className="text-gray-700" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Vizyonumuz</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Gorke's Collection olarak, her kadının kendini özel ve güçlü hissetmesini sağlayacak, zamansız tasarımlar yaratma vizyonuyla yola çıktık. Bizim için takı, sadece bir aksesuar değil, aynı zamanda bir ifade biçimi, bir anı ve bir mirastır.
                                </p>
                            </div>
                        </div>

                        {/* Kalite Anlayışımız Bölümü */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-8 text-right md:text-left">
                             <div className="flex-shrink-0 bg-white p-6 rounded-full shadow-md">
                                <ShieldCheck size={40} className="text-gray-700" />
                            </div>
                            <div className="md:text-right">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Kalite Anlayışımız</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Tasarımlarımızda kullandığımız her materyali özenle seçiyoruz. Kararmayan, suya ve günlük hayatın yıpratıcı etkilerine karşı dayanıklı olan 316L paslanmaz çelik, koleksiyonlarımızın temelini oluşturuyor. Modern teknolojiyi geleneksel işçilikle birleştirerek, yıllarca ilk günkü ışıltısını koruyacak takılar üretiyoruz.
                                </p>
                            </div>
                        </div>

                        {/* Alıntı Bölümü */}
                        <div className="text-center py-12">
                             <Sparkles size={32} className="text-gray-400 mx-auto mb-4" />
                             <p className="text-2xl italic text-gray-700 max-w-2xl mx-auto">
                                "Her bir tasarım, bir kadının hikayesinden ilham alır ve onun hikayesinin bir parçası olmak için yola çıkar."
                             </p>
                        </div>
                        
                        {/* Bize Katılın Bölümü */}
                        <div className="bg-white p-10 rounded-lg shadow-lg text-center">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bize Katılın</h2>
                            <p className="text-gray-600 leading-relaxed max-w-xl mx-auto mb-6">
                                Gorke's Collection ailesi olarak, bu ışıltılı yolculukta sizi de aramızda görmekten mutluluk duyarız. Koleksiyonlarımızı keşfedin ve kendi hikayenizi anlatacak o özel parçayı bulun.
                            </p>
                            <Link href="/" className="inline-block bg-gray-900 text-white font-bold py-3 px-8 rounded-md hover:bg-gray-700 transition-colors">
                                Koleksiyonu Keşfet
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
