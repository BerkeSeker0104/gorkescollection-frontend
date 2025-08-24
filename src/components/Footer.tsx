import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* 1. Sütun: Marka Bilgileri */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/">
                <Image
                    src="/logo-dark.png" // Koyu renk logonuz
                    alt="Gorke's Collection Logo"
                    width={180}
                    height={40}
                />
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Her anınıza ışıltı katmak için tasarlanmış, zamansız ve dayanıklı çelik takılar.
            </p>
          </div>

          {/* 2. Sütun: Müşteri Hizmetleri */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Müşteri Hizmetleri</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/hakkimizda" className="text-sm text-gray-500 hover:text-gray-800">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-sm text-gray-500 hover:text-gray-800">İletişim</Link></li>
              <li><Link href="/sss" className="text-sm text-gray-500 hover:text-gray-800">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="/kargo-ve-iade" className="text-sm text-gray-500 hover:text-gray-800">Kargo ve İade</Link></li>
            </ul>
          </div>

          {/* 3. Sütun: Yasal Bilgiler */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Yasal</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/gizlilik-politikasi" className="text-sm text-gray-500 hover:text-gray-800">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-kosullari" className="text-sm text-gray-500 hover:text-gray-800">Kullanım Koşulları</Link></li>
              <li><Link href="/mesafeli-satis" className="text-sm text-gray-500 hover:text-gray-800">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>

          {/* 4. Sütun: Bülten Kaydı */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Bültenimize Abone Olun</h3>
            <p className="mt-4 text-sm text-gray-500">Yeni gelenlerden ve özel indirimlerden ilk siz haberdar olun.</p>
            <form className="mt-4 flex">
              <input 
                type="email" 
                placeholder="E-posta adresiniz" 
                className="w-full p-2 border border-gray-300 rounded-l-md text-sm focus:ring-gray-500 focus:border-gray-500"
              />
              <button type="submit" className="bg-gray-800 text-white px-4 rounded-r-md hover:bg-gray-700 text-sm">
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* --- GÜNCELLENMİŞ ALT BÖLÜM --- */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
          
          {/* Sol Taraf: Telif Hakkı ve Ödeme Logoları */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Gorke's Collection. Tüm hakları saklıdır.</p>
            <div className="border-t sm:border-t-0 sm:border-l border-gray-200 pl-4 pt-4 sm:pt-0">
              <Image 
                src="/images/paytr/tekparca-logolar-1.jpg"
                alt="Visa, Mastercard, Troy ile güvenli ödeme"
                width={300}  // Genişlik artırıldı
                height={63}  // Oranı korumak için yükseklik de artırıldı
                className="h-auto"
              />
            </div>
          </div>

          {/* Sağ Taraf: Sosyal Medya (Yeni ikonlarla) */}
          <div className="flex space-x-4">
            <a href="https://www.instagram.com/gorkescollection/" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image 
                src="/images/social-media/instagram.png"
                alt="Instagram"
                width={28}
                height={28}
              />
            </a>
            <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image 
                src="/images/social-media/tiktok.png"
                alt="TikTok"
                width={28}
                height={28}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
