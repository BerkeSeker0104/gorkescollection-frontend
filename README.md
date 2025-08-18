# Gorkes Collection — Frontend

Kadın takı e‑ticaret sitesi için **Next.js (App Router) + TypeScript + TailwindCSS** tabanlı frontend.

## 🚀 Özellikler
- **Next.js 15.4.5 / React 19** (App Router)
- **Tailwind CSS ^4** ile stil
- **Form yönetimi:** react-hook-form + **Zod** doğrulama
- **Durum yönetimi (context):** Auth, Sepet, Favoriler
- **Görseller:** Next/Image, Cloudinary upload (imzalı)
- **Bildirimler:** react-hot-toast
- **Carousel:** embla-carousel

## 📦 Bağımlılıklar (özet)
- `next@15.4.5`, `react`, `react-dom`
- `tailwindcss@^4`, `@tailwindcss/postcss`, `autoprefixer`
- `react-hook-form`, `@hookform/resolvers`, `zod`
- `lucide-react`, `embla-carousel-react`, `embla-carousel-autoplay`
- `js-cookie`, `jwt-decode`, `react-hot-toast`

## 🗂️ Klasör Yapısı (kısaltılmış)
```
src/
  app/                   # App Router sayfaları
  components/            # UI bileşenleri
  context/               # Auth/Cart/Favorites contextleri
  lib/                   # api.ts (backend erişimi), uploadToCloudinary.ts
  types/                 # TypeScript tipleri
public/                  # Statik varlıklar (logo, görseller, video)
```
Daha fazla ayrıntı için: **FRONTEND_DOKUMANTASYON.md** dosyasına bakın.

## 🌐 Rotalar
- `/                                        ← src/app/layout.tsx`
- `/                                        ← src/app/page.tsx`
- `/[slug]                                  ← src/app/[slug]/page.tsx`
- `/admin                                   ← src/app/admin/layout.tsx`
- `/admin                                   ← src/app/admin/page.tsx`
- `/admin/ayarlar                           ← src/app/admin/ayarlar/page.tsx`
- `/admin/kategoriler                       ← src/app/admin/kategoriler/page.tsx`
- `/admin/siparisler                        ← src/app/admin/siparisler/page.tsx`
- `/admin/siparisler/[id]                   ← src/app/admin/siparisler/[id]/page.tsx`
- `/admin/urunler                           ← src/app/admin/urunler/page.tsx`
- `/admin/urunler/duzenle/[id]              ← src/app/admin/urunler/duzenle/[id]/page.tsx`
- `/admin/urunler/yeni                      ← src/app/admin/urunler/yeni/page.tsx`
- `/favoriler                               ← src/app/favoriler/page.tsx`
- `/giris                                   ← src/app/giris/page.tsx`
- `/gizlilik-politikasi                     ← src/app/gizlilik-politikasi/page.tsx`
- `/hakkimizda                              ← src/app/hakkimizda/page.tsx`
- `/hesabim                                 ← src/app/hesabim/page.tsx`
- `/hesap-dogrulama                         ← src/app/hesap-dogrulama/page.tsx`
- `/iletisim                                ← src/app/iletisim/page.tsx`
- `/kargo-ve-iade                           ← src/app/kargo-ve-iade/page.tsx`
- `/kayit                                   ← src/app/kayit/page.tsx`
- `/kullanim-kosullari                      ← src/app/kullanim-kosullari/page.tsx`
- `/mesafeli-satis                          ← src/app/mesafeli-satis/page.tsx`
- `/odeme                                   ← src/app/odeme/page.tsx`
- `/sepet                                   ← src/app/sepet/page.tsx`
- `/sifre-sifirla                           ← src/app/sifre-sifirla/page.tsx`
- `/sifremi-unuttum                         ← src/app/sifremi-unuttum/page.tsx`
- `/siparis-onay/[id]                       ← src/app/siparis-onay/[id]/page.tsx`
- `/sitemap.xml                             ← src/app/sitemap.xml/route.ts`
- `/sss                                     ← src/app/sss/page.tsx`
- `/urun/[id]                               ← src/app/urun/[id]/page.tsx`
- `/yeni-gelenler                           ← src/app/yeni-gelenler/page.tsx`

## 🔐 Kimlik Doğrulama
- Cookie tabanlı oturum (JWT `token` + `user` cookie'leri).
- `AuthContext` login/logout ve `isAdmin` (JWT içindeki role claim) yönetir.
- API istekleri `credentials: 'include'` ile gönderilir.

## 🛒 Sepet & Favoriler
- `CartContext`: `getCart`, `addToCart`, `removeFromCart` ile senkronizasyon.
- `FavoritesContext`: favori ekleme/çıkarma ve listeleme.

## 🧩 Önemli Bileşenler
- `Header`, `Footer`, `ProductCard`, `ProductForm`, `AddToCartButton`, `ProductMarquee`, `CategoryGridClient`, `ImageUploader`

## 🔗 Backend API (özet)
Tüm istekler `NEXT_PUBLIC_API_URL` kökü altında:
- `/api/products`, `/api/products/{id}`, `/api/products/featured`
- `/api/categories`
- `/api/auth/login`, `/api/auth/register`, `/api/auth/confirm-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- `/api/cart`, `/api/cart/items`
- `/api/favorites`, `/api/favorites/{productId}`
- `/api/orders`, `/api/orders/{id}`
- `/api/admin/products/*`, `/api/admin/categories/*`, `/api/admin/orders/*`, `/api/admin/settings`, `/api/admin/upload-signature`

Detaylı imzalı **Cloudinary** yükleme akışı: `src/lib/uploadToCloudinary.ts`

## ⚙️ Ortam Değişkenleri
| Variable | Required | Example | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.example.com` | Backend kök URL'si. Tüm `fetch` istekleri buradan yapılır. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://www.gorkescollection.com` | Canonical URL, yönlendirmeler/sitemap vb. için. |
| `NEXT_PUBLIC_CHECKOUT_ENABLED` | ❌ | `true` | Ödeme adımını aç/kapat (feature flag). |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | `mycloud` | Cloudinary yüklemeleri için cloud adı. |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | ✅ | `1234567890` | İstemci tarafı upload için public API key. |

`.env.local` örneği:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://www.gorkescollection.com
NEXT_PUBLIC_CHECKOUT_ENABLED=true
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_public_key
```

## 🛠️ Komutlar
```bash
npm run dev     # Geliştirme (Next dev)
npm run build   # Production build
npm run start   # Production server
npm run lint    # (Next) Lint
```

> Not: `dev` script'inde `NODE_TLS_REJECT_UNAUTHORIZED=0` yer alıyor. Bu yalnızca **geliştirme** için önerilir. Üretimde kaldırın.

## 🏗️ Çalıştırma
1. `npm ci` (veya `npm install`)
2. `.env.local` dosyasını oluşturun
3. `npm run dev` → `http://localhost:3000`

## 🚢 Deploy
- **Vercel** önerilir: `NEXT_PUBLIC_*` env'lerini Vercel Project Settings → Environment Variables altına ekleyin.
- `next.config.ts` Cloudinary/remote görsellere izin verir.

## 🔍 Kod Kalitesi
- TypeScript aktif. İsteğe bağlı: **ESLint** kuralları ve **Prettier** eklenebilir.
- Form validasyonu Zod ile tip güvenli.

## 📝 Katkı
PR açmadan önce: `npm run lint && npm run build`.

## 📄 Lisans
Bu depo özeldir. Gerekirse lisans ekleyin.
