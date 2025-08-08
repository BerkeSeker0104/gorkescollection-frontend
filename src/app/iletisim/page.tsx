import { Mail, Phone, Instagram, Facebook } from 'lucide-react';

// TikTok ikonu için özel bir SVG bileşeni oluşturuyoruz, çünkü lucide-react'te mevcut değil.
const TiktokIcon = ({ size = 24, className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8.11V4h-5v12.55a4.5 4.5 0 1 1-5.03-5.45A4.5 4.5 0 1 1 16 9.55Z" />
    </svg>
  );

export default function ContactPage() {
    return (
        <div className="bg-cream pt-32">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Sayfa Başlığı */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Bize Ulaşın
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Sorularınız, önerileriniz veya iş birlikleri için bizimle iletişime geçmekten çekinmeyin.
                        </p>
                    </div>

                    {/* İletişim Bilgileri ve Sosyal Medya */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Sol Taraf: İletişim Kanalları */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">İletişim Bilgileri</h2>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 p-3 rounded-full">
                                            <Mail size={24} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">E-posta</h3>
                                            <a href="mailto:info@gorkescollection.com" className="text-gray-600 hover:text-gray-900">
                                                gorkescollection@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-3 rounded-full">
                                        <Phone size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Telefon (Whatsapp)</h3>
                                        <a 
                                          href="https://wa.me/905308331705" // Numarayı uluslararası formatta (+ olmadan) yazın
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-gray-600 hover:text-gray-900"
                                        >
                                            +90 530 833 17 05
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Sağ Taraf: Sosyal Medya */}
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sosyal Medya</h2>
                                <p className="text-gray-600 mb-6">
                                    En yeni tasarımlarımızı ve kampanyalarımızı kaçırmamak için bizi sosyal medyada takip edin.
                                </p>
                                <div className="flex space-x-6">
                                    <a 
                                      href="https://www.instagram.com/gorkescollection/" 
                                      className="text-gray-500 hover:text-gray-800"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                        <span className="sr-only">Instagram</span>
                                        <Instagram size={28} />
                                    </a>
                                    <a href="#" className="text-gray-500 hover:text-gray-800">
                                        <span className="sr-only">Facebook</span>
                                        <Facebook size={28} />
                                    </a>
                                    {/* DEĞİŞİKLİK BURADA: Twitter'ı TikTok ile değiştirdik */}
                                    <a href="#" className="text-gray-500 hover:text-gray-800">
                                        <span className="sr-only">Tiktok</span>
                                        <TiktokIcon size={28} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
