import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Sayfa Başlığı */}
                    <div className="text-center mb-12">
                        <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Gizlilik Politikası
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Kişisel verilerinizin güvenliği bizim için önemlidir.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">Son Güncelleme: 06 Ağustos 2025</p>
                    </div>

                    {/* Ana İçerik Alanı */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg">
                        <div className="prose max-w-none text-gray-600 leading-relaxed space-y-6">
                            <p>
                                Gorke's Collection olarak, kullanıcılarımızın hizmetlerimizden güvenli ve eksiksiz şekilde faydalanmalarını sağlamak amacıyla sitemizi kullanan üyelerimizin gizliliğini korumak için çalışıyoruz. Bu doğrultuda, işbu Gizlilik Politikası, üyelerimizin kişisel verilerinin 6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) ile tamamen uyumlu bir şekilde işlenmesi ve kullanıcılarımızı bu bağlamda bilgilendirmek amacıyla hazırlanmıştır.
                            </p>

                            <h3>1. Hangi Veriler İşlenmektedir?</h3>
                            <p>
                                Aşağıda Gorke's Collection tarafından işlenen ve Kanun uyarınca kişisel veri sayılan verilerin hangileri olduğu sıralanmıştır. Aksi açıkça belirtilmedikçe, işbu Politika kapsamında arz edilen hüküm ve koşullar kapsamında “kişisel veri” ifadesi aşağıda yer alan bilgileri kapsayacaktır.
                            </p>
                            <ul>
                                <li>Kimlik Bilgisi (Ad, Soyad)</li>
                                <li>İletişim Bilgisi (E-posta adresi, telefon numarası, adres)</li>
                                <li>Kullanıcı İşlem Bilgisi (Sipariş geçmişi, sepet bilgileri)</li>
                                <li>İşlem Güvenliği Bilgisi (IP adresi bilgileri)</li>
                            </ul>

                            <h3>2. Veri İşleme Amaçları</h3>
                            <p>
                                Kişisel verileriniz, sipariş süreçlerinin yürütülmesi, üyelik işlemlerinin tamamlanması, iletişim faaliyetlerinin sağlanması, yasal yükümlülüklerin yerine getirilmesi ve hizmet kalitemizin artırılması amaçlarıyla işlenmektedir.
                            </p>

                            <h3>3. Verilerin Aktarımı</h3>
                            <p>
                                Kişisel verileriniz, yasal zorunluluklar ve hizmetin gerektirdiği durumlar (kargo firmaları, ödeme kuruluşları) dışında üçüncü kişilerle paylaşılmamaktadır. Veri aktarımı, Kanun’un 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde gerçekleştirilmektedir.
                            </p>
                            
                            <h3>4. Çerez Politikası</h3>
                            <p>
                                Sitemizde, kullanıcı deneyimini geliştirmek amacıyla çerezler (cookies) kullanılmaktadır. Çerez politikamız hakkında detaylı bilgi almak için ilgili sayfamızı ziyaret edebilirsiniz.
                            </p>

                            <h3>5. Veri Sahibinin Hakları</h3>
                            <p>
                                Kanun’un 11. maddesi uyarınca veri sahipleri, kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme gibi haklara sahiptir. Bu haklarınızı kullanmak için <code>gorkescollection@gmail.com</code> adresi üzerinden bizimle iletişime geçebilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
