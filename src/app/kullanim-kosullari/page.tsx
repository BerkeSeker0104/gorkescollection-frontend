import { FileText } from 'lucide-react';

export default function TermsOfUsePage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Sayfa Başlığı */}
                    <div className="text-center mb-12">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Kullanım Koşulları
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Web sitemizi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">Son Güncelleme: 06 Ağustos 2025</p>
                    </div>

                    {/* Ana İçerik Alanı */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg">
                        <div className="prose max-w-none text-gray-600 leading-relaxed space-y-6">
                            <h3>1. Taraflar</h3>
                            <p>
                                İşbu Kullanıcı Sözleşmesi ("Sözleşme"), Gorke's Collection ile web sitesini ("Site") ziyaret eden veya üye olan kullanıcı ("Kullanıcı") arasında akdedilmiştir. Siteye erişim sağlamakla veya siteyi kullanmakla, bu sözleşmeyi okuduğunuzu, anladığınızı ve şartlarına bağlı olduğunuzu kabul etmiş sayılırsınız.
                            </p>

                            <h3>2. Hizmetlerin Tanımı</h3>
                            <p>
                                Gorke's Collection, Site üzerinden kullanıcılara çelik takı ürünlerinin tanıtımını ve online satışını sunmaktadır. Sunulan hizmetler, zaman zaman Gorke's Collection tarafından tek taraflı olarak değiştirilebilir.
                            </p>

                            <h3>3. Kullanıcının Yükümlülükleri</h3>
                            <p>
                                Kullanıcı, siteyi kullanırken yürürlükteki tüm yasalara uymayı kabul eder. Üyelik oluştururken verilen bilgilerin doğru ve güncel olmasından Kullanıcı sorumludur. Hesap güvenliğinin sağlanması (şifre vb.) tamamen Kullanıcı'nın sorumluluğundadır. Site'nin altyapısına zarar verecek veya diğer kullanıcıları rahatsız edecek davranışlarda bulunulamaz.
                            </p>
                            
                            <h3>4. Fikri Mülkiyet Hakları</h3>
                            <p>
                                Site'de yer alan tüm tasarımlar, logolar, metinler, görseller ve diğer tüm içerikler Gorke's Collection'a aittir ve fikri mülkiyet kanunları tarafından korunmaktadır. Bu içerikler, Gorke's Collection'ın yazılı izni olmaksızın kopyalanamaz, çoğaltılamaz veya dağıtılamaz.
                            </p>

                            <h3>5. Sorumluluğun Sınırlandırılması</h3>
                            <p>
                                Gorke's Collection, Site'nin kesintisiz veya hatasız olacağını garanti etmez. Ürün açıklamaları ve fiyatlandırmalarda oluşabilecek yazım hatalarından dolayı Gorke's Collection sorumlu tutulamaz ve bu durumlarda siparişi iptal etme veya düzeltme hakkını saklı tutar.
                            </p>
                            
                            <h3>6. Sözleşmenin Feshi</h3>
                            <p>
                                Gorke's Collection, Kullanıcı'nın işbu sözleşme şartlarından herhangi birini ihlal etmesi durumunda, üyeliği askıya alma veya tek taraflı olarak feshetme hakkını saklı tutar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
