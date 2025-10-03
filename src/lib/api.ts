import {
  AdminProductDto,
  Address,
  CartDto,
  ShippingAddress,
  LoginData,
  RegisterData,
  UserDto,
  Order,
  Product,
  Category,
  ShipOrderDto,
  AdminCategoryDto,
  Setting,
  ChangePasswordData,
  ForgotPasswordData, 
  ResetPasswordData,
  Review,
  StockNotificationSubscriber,
  Coupon,
} from '@/types';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Misafir sepet kimliği (cookie çalışmazsa header ile taşırız)
const GUEST_HEADER = 'X-Guest-Id';
const GUEST_STORAGE_KEY = 'guestId';

const getGuestId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_STORAGE_KEY);
};

const setGuestId = (id: string) => {
  if (typeof window === 'undefined' || !id) return;
  localStorage.setItem(GUEST_STORAGE_KEY, id);
};

const ensureGuestId = (): string => {
  const current = getGuestId();
  if (current) return current;
  const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  setGuestId(id);
  return id;
};

// Sunucu header ile guestId döndürürse tarafa yaz
const persistGuestFromResponse = (res: Response) => {
  const hdr = res.headers.get(GUEST_HEADER);
  if (hdr && hdr.trim()) setGuestId(hdr.trim());
};

// YENİ MERKEZİ FONKSİYON: Token'ı localStorage'dan al
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// GÜNCELLENMİŞ MERKEZİ FONKSİYON: Her zaman geçerli bir Headers nesnesi döndürür
const getAuthHeaders = (): HeadersInit => {
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // << YENİ: misafir ID varsa header'a ekle
  const guestId = getGuestId();
  if (guestId) headers['X-Guest-Id'] = guestId;

  return headers;
};

/* ------------------------------------------------------------------------- */
/* HERKESE AÇIK FONKSİYONLAR                                                */
/* ------------------------------------------------------------------------- */

// YENİ: Ürün arama fonksiyonu
export const searchProducts = async (query: string): Promise<Product[]> => {
  // Boş sorgu gönderilmesini engelle
  if (!query.trim()) {
    return [];
  }
  try {
    const url = `${API_URL}/api/products/search?q=${encodeURIComponent(query.trim())}`;
    
    // Arama sonuçları anlık olmalı, bu yüzden cache kullanmıyoruz.
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Arama yapılırken sunucu hatası:', res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Arama yapılırken ağ hatası:', error);
    return [];
  }
};

export const getStockNotificationSubscribers = async (
  productId: number
): Promise<StockNotificationSubscriber[]> => {
  
  try {
    const res = await fetch(`${API_URL}/api/admin/notifications/${productId}`, {
      headers: getAuthHeaders(), // <--- DEĞİŞİKLİK BURADA
      cache: 'no-store' // Admin verisi olduğu için önbelleğe almamak en iyisi
    });

    if (!res.ok) {
      console.error("Aboneler çekilirken hata oluştu:", res.statusText);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Aboneler çekilirken bir ağ hatası oluştu:", error);
    return [];
  }
};

export const subscribeToStockNotification = async (
  productId: number,
  email: string
): Promise<{ success: boolean; message: string }> => {
  
  const res = await fetch(`${API_URL}/api/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, email }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Backend'den gelen hata mesajını kullan, yoksa genel bir mesaj göster
    return { success: false, message: data.message || "Bir hata oluştu." };
  }

  return { success: true, message: data.message || "İsteğiniz başarıyla alındı." };
};

export const postReview = async (productId: string, data: { rating: number; comment?: string }): Promise<Review | null> => {
  const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // YENİ
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = 'Yorum gönderilemedi.';
    try { const errorData = await res.json(); if (errorData?.message) message = errorData.message; } catch {}
    throw new Error(message);
  }
  return res.json();
};


export const getReviewsForProduct = async (productId: string): Promise<Review[]> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/reviews`);
    if (!res.ok) {
      console.error("Yorumlar çekilemedi.");
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Yorumları çekerken hata:", error);
    return [];
  }
};

export const deleteReview = async (reviewId: number): Promise<boolean> => {
  const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(), // Mevcut yetkilendirme yapınızı kullanır
    },
  });
  return res.ok;
};

export async function initiatePaytrPayment(address: ShippingAddress, guestEmail?: string, preferredCarrier?: string, couponCode?: string) {
  // A)
  ensureGuestId();

  const res = await fetch(`${API_URL}/api/payments/initiate-payment`, {
    method: "POST",
    credentials: 'include',
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ shippingAddress: address, email: guestEmail, preferredCarrier, couponCode }),
  });

  // B)
  persistGuestFromResponse(res);

  if (!res.ok) { 
    const errorBody = await res.json().catch(() => ({ message: "Ödeme başlatılamadı."}));
    throw new Error(errorBody.message || "Ödeme başlatılamadı"); 
  }
  const data = await res.json();
  return (data?.iframeToken ?? data?.token) as string | undefined;
}



export const getProducts = async (
  sortBy?: string,
  categorySlug?: string
): Promise<Product[]> => {
  try {
    const qs: string[] = [];
    if (sortBy) qs.push(`sortBy=${encodeURIComponent(sortBy)}`);
    if (categorySlug) qs.push(`categorySlug=${encodeURIComponent(categorySlug)}`);

    const url = `${API_URL}/api/products${qs.length ? `?${qs.join("&")}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();

    // Dizi dönerse
    if (Array.isArray(data)) return data as Product[];
    // { items: [...] } dönerse
    if (data && Array.isArray(data.items)) return data.items as Product[];

    return [];
  } catch (error) {
    console.error("Ürünler alınırken ağ hatası:", error);
    return [];
  }
};


export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Kategoriler alınırken ağ hatası:', error);
    return [];
  }
};

/* ------------------------------------------------------------------------- */
/* KULLANICI HESABI – SİPARİŞ, ADRES vb.                                     */
/* ------------------------------------------------------------------------- */

export const getOrders = async (): Promise<Order[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Siparişler alınırken ağ hatası:', error);
    return [];
  }
};

export const getAddresses = async (): Promise<Address[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/api/account/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Adresler alınırken ağ hatası:', error);
    return [];
  }
};

export const addAddress = async (address: ShippingAddress): Promise<Address | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/account/addresses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Adres eklenirken ağ hatası:', error);
    return null;
  }
};

export const updateAddress = async (address: Address): Promise<boolean> => {
  const token = getToken();
  if (!token || !address?.id) return false;
  try {
    const res = await fetch(`${API_URL}/api/account/addresses/${address.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    return res.ok;
  } catch (e) {
    console.error('Adres güncelle hatası:', e);
    return false;
  }
};



export const deleteAddress = async (addressId: number): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/api/account/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (error) {
    console.error('Adres silinirken ağ hatası:', error);
    return false;
  }
};

/* ------------------------------------------------------------------------- */
/* KİMLİK DOĞRULAMA                                                          */
/* ------------------------------------------------------------------------- */

export const loginUser = async (data: LoginData): Promise<{ user: UserDto | null; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    // ÖNEMLİ: Login endpoint'i cookie set etmeyeceği için artık credentials: 'include' GEREKMİYOR.
    if (!response.ok) {
      const errorText = await response.text();
      return { user: null, error: errorText || 'Yetkisiz.' };
    }
    return { user: await response.json(), error: undefined };
  } catch (error) {
    return { user: null, error: 'Sunucuya ulaşılamadı.' };
  }
};

// --- GÜNCELLENDİ: registerUser fonksiyonu artık mesaj döndürüyor ---
export const registerUser = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Gönderilen veri yapısı yeni RegisterData tipine uygun hale getirildi.
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }),
    });
    
    const result = await response.json();

    if (!response.ok) {
        const errorMessage = result.errors ? Object.values(result.errors).flat().join(' ') : (result.message || "Bilinmeyen bir hata oluştu.");
        return { success: false, message: errorMessage };
    }

    return { success: true, message: result.message };

  } catch (error) {
    console.error('Kayıt sırasında ağ/fetch hatası:', error);
    return { success: false, message: 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.' };
  }
};

// --- YENİ: E-POSTA DOĞRULAMA FONKSİYONU ---
// Bu fonksiyon backend'e GET isteği atar, çünkü kullanıcı linke tıklar.
// Backend, başarılı olursa bizi giriş sayfasına yönlendirir.
export const confirmEmail = async (userId: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/auth/confirm-email?userId=${userId}&token=${token}`, {
            method: 'GET',
        });
        // Backend'in yönlendirmesi (redirect) başarılı kabul edilir.
        // Eğer yönlendirme yoksa veya durum kodu 200-299 aralığında değilse, başarısızdır.
        return response.ok || response.redirected;
    } catch (error) {
        console.error('E-posta doğrulanırken ağ hatası:', error);
        return false;
    }
};

// YENİ: Doğrulama e-postasını tekrar göndermek için fonksiyon
export const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/resend-confirmation-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    // Bu endpoint güvenlik nedeniyle her zaman başarılı dönecek şekilde tasarlandı,
    // bu yüzden sadece cevaptaki mesajı alıp dönüyoruz.
    const result = await response.json();
    return { success: response.ok, message: result.message };

  } catch (error) {
    console.error('Doğrulama e-postası tekrar gönderilirken ağ hatası:', error);
    return { success: false, message: 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.' };
  }
};

/* ------------------------------------------------------------------------- */
/* SEPET & SİPARİŞ                                                          */
/* ------------------------------------------------------------------------- */

export const getCart = async (): Promise<CartDto | null> => {
  try {
    // A) misafir ID’yi garanti altına al
    ensureGuestId();

    const res = await fetch(`${API_URL}/api/cart`, {
      method: 'GET',
      credentials: 'include',
      headers: { ...getAuthHeaders() },
      cache: 'no-store',
    });

    // B) sunucu header ile yeni ID döndürdüyse sakla
    persistGuestFromResponse(res);

    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
};

export const addToCart = async (productId: number, quantity: number): Promise<CartDto | null> => {
  try {
    // A)
    ensureGuestId();

    const res = await fetch(`${API_URL}/api/cart/items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ productId, quantity }),
      cache: 'no-store',
    });

    // B)
    persistGuestFromResponse(res);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || errorData.title || 'Ürün sepete eklenemedi.');
    }
    return res.json();
  } catch (error) {
    console.error('Sepete eklenirken hata:', error);
    throw error;
  }
};

export const removeFromCart = async (productId: number, quantity: number): Promise<CartDto | null> => {
  try {
    // A)
    ensureGuestId();

    const res = await fetch(`${API_URL}/api/cart/items`, {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ productId, quantity }),
    });

    // B)
    persistGuestFromResponse(res);

    if (res.status === 204) {
      return await getCart();
    }
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (!res.ok) {
      try {
        const err = text ? JSON.parse(text) : null;
        const msg = err?.message || err?.detail || err?.title || `Sepetten çıkarılamadı (HTTP ${res.status}).`;
        throw new Error(msg);
      } catch {
        throw new Error(`Sepetten çıkarılamadı (HTTP ${res.status}).`);
      }
    }
    if (!text) return await getCart();
    if (contentType.includes('application/json')) {
      return JSON.parse(text) as CartDto;
    }
    return await getCart();
  } catch (e) {
    console.error('removeFromCart hata:', e);
    return await getCart();
  }
};

export const createOrder = async (address: ShippingAddress): Promise<string | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shippingAddress: address }),
    });
    if (!response.ok) {
      console.error('Sipariş oluşturma başarısız:', response.statusText);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Sipariş oluşturma sırasında ağ hatası:', error);
    return null;
  }
};

/* ------------------------------------------------------------------------- */
/* ADMİN FONKSİYONLARI                                                       */
/* ------------------------------------------------------------------------- */

export const createProduct = async (productData: AdminProductDto): Promise<Product | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/api/admin/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) return null;

    // Backend boş body döndüyse burada hata fırlatmamak için:
    const text = await response.text();
    if (!text) {
      // Boş gövde -> yine de başarılı
      return {} as Product;
    }

    return JSON.parse(text) as Product;
  } catch (error) {
    console.error('Ürün oluşturulurken ağ hatası:', error);
    return null;
  }
};


export const updateProduct = async (productId: number, productData: AdminProductDto): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    return response.ok;
  } catch (error) {
    console.error('Ürün güncellenirken ağ hatası:', error);
    return false;
  }
};

export const deleteProduct = async (productId: number): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error('Ürün silinirken ağ hatası:', error);
    return false;
  }
};

export const getCloudinarySignature = async (): Promise<any | null> => {
  const token = getToken(); // opsiyonel
  try {
    const response = await fetch(`${API_URL}/api/admin/upload-signature`, {
      method: 'POST',                            // << GET değil POST olmalı
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // İsterseniz imzada klasör vs. gönderebilirsiniz:
      // body: JSON.stringify({ folder: 'products' })
    });

    if (!response.ok) {
      console.error('Cloudinary imzası alınamadı:', response.status, await response.text());
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Cloudinary imzası alınırken ağ hatası:', error);
    return null;
  }
};


export const getAllOrders = async (): Promise<Order[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const response = await fetch(`${API_URL}/api/admin/orders`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Tüm siparişler alınırken ağ hatası:', error);
    return [];
  }
};

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Sipariş detayı alınırken ağ hatası:', error);
    return null;
  }
};

export const shipOrder = async (orderId: number, shippingData: ShipOrderDto): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/ship`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shippingData),
    });
    return response.ok;
  } catch (error) {
    console.error('Kargo bilgisi kaydedilirken ağ hatası:', error);
    return false;
  }
};

// --- YENİ SİPARİŞ DURUM GÜNCELLEME FONKSİYONLARI ---

// Tekrarlanan kodu azaltmak için yardımcı bir fonksiyon
const updateOrderStatus = async (orderId: number, action: 'process' | 'deliver' | 'cancel'): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/${action}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    // Backend'den hata mesajı gelirse yakalayıp fırlat
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || errorData?.title || 'İşlem başarısız oldu.');
    }
    return true;
  } catch (error) {
    console.error(`Sipariş durumu güncellenirken hata (${action}):`, error);
    // Hatanın UI'da gösterilebilmesi için tekrar fırlat
    throw error;
  }
};

export const markOrderAsProcessing = (orderId: number) => updateOrderStatus(orderId, 'process');
export const markOrderAsDelivered = (orderId: number) => updateOrderStatus(orderId, 'deliver');
export const cancelOrder = async (orderId: number): Promise<boolean> => {
  // CancelOrder'ın stoğu geri ekleme gibi yan etkileri olduğu için
  // ve daha spesifik hata mesajları dönebileceği için ayrı yönetmek daha güvenli.
  try {
    const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || errorData?.title || 'Sipariş iptal edilemedi.');
    }
    return true;
  } catch(error) {
    console.error('Sipariş iptal edilirken hata:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: AdminCategoryDto): Promise<Category | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/api/admin/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Kategori oluşturulurken ağ hatası:', error);
    return null;
  }
};

export const updateCategory = async (categoryId: number, categoryData: AdminCategoryDto): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    return response.ok;
  } catch (error) {
    console.error('Kategori güncellenirken ağ hatası:', error);
    return false;
  }
};

export const deleteCategory = async (categoryId: number): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error('Kategori silinirken ağ hatası:', error);
    return false;
  }
};

/* ------------------------------------------------------------------------- */
/* FAVORİLER & AYARLAR                                                       */
/* ------------------------------------------------------------------------- */

export const getFavorites = async (): Promise<Product[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Favoriler alınırken ağ hatası:', error);
    return [];
  }
};

export const toggleFavorite = async (productId: number): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/favorites/${productId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error('Favori değiştirilirken ağ hatası:', error);
    return false;
  }
};

export const getSettings = async (): Promise<Setting[]> => {
  try {
    const res = await fetch(`${API_URL}/api/settings`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Ayarlar alınırken ağ hatası:', error);
    return [];
  }
};

export const updateSettings = async (settings: Setting[]): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    return response.ok;
  } catch (error) {
    console.error('Ayarlar güncellenirken ağ hatası:', error);
    return false;
  }
};

// --- YENİ: PAROLA DEĞİŞTİRME FONKSİYONU ---
export const changePassword = async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Bu işlem için giriş yapmalısınız.' };
  }

  try {
    const response = await fetch(`${API_URL}/api/account/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Backend'den gelen çeşitli hata formatlarını yakalamak için
      const errorMessage = 
        result.errors ? Object.values(result.errors).flat().join(' ') // Model state hataları
        : result.message || 'Bilinmeyen bir hata oluştu.'; // Özel mesajlar
      return { success: false, message: errorMessage };
    }

    return { success: true, message: result.message || 'Şifre başarıyla güncellendi.' };

  } catch (error) {
    console.error('Şifre değiştirilirken ağ hatası:', error);
    return { success: false, message: 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.' };
  }
};

// --- YENİ: ŞİFREMİ UNUTTUM FONKSİYONU ---
export const forgotPassword = async (data: ForgotPasswordData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    // Bu endpoint her zaman başarılı dönecek şekilde tasarlandı,
    // bu yüzden sadece cevabı alıp dönüyoruz.
    const result = await response.json();
    return { success: response.ok, message: result.message };

  } catch (error) {
    console.error('Şifre sıfırlama talebi sırasında ağ hatası:', error);
    return { success: false, message: 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.' };
  }
};

// --- YENİ: ŞİFRE SIFIRLAMA FONKSİYONU ---
export const resetPassword = async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
        const errorMessage = result.message || 'Bilinmeyen bir hata oluştu.';
        return { success: false, message: errorMessage };
    }

    return { success: true, message: result.message };

  } catch (error) {
    console.error('Şifre sıfırlama sırasında ağ hatası:', error);
    return { success: false, message: 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.' };
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Ürün detayı alınırken ağ hatası:", err);
    return null;
  }
};

// --- EKLE: sayfalı çağrı ---
export const getProductsPaged = async (opts: {
  sortBy?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number; page: number; pageSize: number }> => {
  const qs: string[] = [];
  if (opts.sortBy) qs.push(`sortBy=${encodeURIComponent(opts.sortBy)}`);
  if (opts.categorySlug) qs.push(`categorySlug=${encodeURIComponent(opts.categorySlug)}`);
  if (opts.page) qs.push(`page=${opts.page}`);
  if (opts.pageSize) qs.push(`pageSize=${opts.pageSize}`);

  const url = `${API_URL}/api/products${qs.length ? `?${qs.join("&")}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { items: [], total: 0, page: opts.page ?? 1, pageSize: opts.pageSize ?? 20 };
  const data = await res.json();
  if (Array.isArray(data)) {
    // Eski formatla uyumluluk
    return { items: data as Product[], total: (data as Product[]).length, page: 1, pageSize: data.length };
  }
  return {
    items: Array.isArray(data.items) ? (data.items as Product[]) : [],
    total: Number(data.total ?? 0),
    page: Number(data.page ?? (opts.page ?? 1)),
    pageSize: Number(data.pageSize ?? (opts.pageSize ?? 20)),
  };
};

// --- EKLE: tüm sayfaları birleştir ---
export const getAllProducts = async (): Promise<Product[]> => {
  const pageSize = 100; // backend en fazla 100'e izin veriyor
  let page = 1;
  const all: Product[] = [];

  while (true) {
    const { items, total } = await getProductsPaged({ page, pageSize });
    all.push(...items);
    if (all.length >= total || items.length === 0) break;
    page++;
  }
  return all;
};

// --- ÖNE ÇIKANLAR ---
export const getFeaturedProducts = async (take = 12): Promise<Product[]> => {
  try {
    const url = `${API_URL}/api/products/featured?take=${take}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Öne çıkanlar alınamadı:", e);
    return [];
  }
};

// --- Dinamik carrier listesi ---
export type CarrierMini = { id: number; name: string };

export const getCarriers = async (): Promise<CarrierMini[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/api/admin/shipping/carriers`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

// --- Navlungo: siparişten gönderi oluştur ---
export type CreateShipmentDto = {
  desi?: number;
  carrierId?: number; // varsayılan: 9
  postType?: number;  // varsayılan: 1
  note?: string;
};

export const createShipment = async (
  orderId: number,
  dto: CreateShipmentDto
): Promise<{ postNumber?: string; trackingUrl?: string; barcodeUrl?: string } | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/create-shipment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Navlungo gönderi oluşturulurken ağ/servis hatası:', err);
    return null;
  }
};

export const applyCoupon = async (couponCode: string): Promise<CartDto | null> => {
  try {
    // A)
    ensureGuestId();

    const res = await fetch(`${API_URL}/api/cart/apply-coupon`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ couponCode }),
    });

    // B)
    persistGuestFromResponse(res);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Geçersiz kupon kodu.');
    }
    return res.json();
  } catch (error) {
    console.error('Kupon uygulanırken hata:', error);
    throw error;
  }
};

export const removeCoupon = async (): Promise<CartDto | null> => {
  try {
    // A) misafir ID garanti
    ensureGuestId();

    const res = await fetch(`${API_URL}/api/cart/remove-coupon`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    // B) sunucu yeni guest id döndürdüyse sakla
    persistGuestFromResponse(res);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || err?.detail || err?.title || 'Kupon kaldırılamadı.');
    }
    return res.json();
  } catch (e) {
    console.error('Kupon kaldırılırken hata:', e);
    throw e;
  }
};

// --- YENİ EKLENECEK KUPON YÖNETİMİ FONKSİYONLARI ---

export const getCoupons = async (): Promise<Coupon[]> => {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Kuponlar alınamadı.');
    return res.json();
  } catch (error) {
    console.error('Kuponlar alınırken ağ hatası:', error);
    return [];
  }
};

// Yeni kupon oluştururken ID ve timesUsed göndermeyiz, bu yüzden Omit kullanıyoruz.
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'timesUsed'>): Promise<Coupon> => {
  const res = await fetch(`${API_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Kupon oluşturulamadı.' }));
    throw new Error(error.message || 'Bilinmeyen bir hata oluştu.');
  }
  return res.json();
};

export const updateCoupon = async (couponId: number, couponData: Coupon): Promise<Coupon> => {
  const res = await fetch(`${API_URL}/api/admin/coupons/${couponId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Kupon güncellenemedi.' }));
    throw new Error(error.message || 'Bilinmeyen bir hata oluştu.');
  }
  // Backend NoContent (204) döneceği için güncellenmiş veriyi geri döndürüyoruz.
  return couponData;
};

export const deleteCoupon = async (couponId: number): Promise<boolean> => {
  const res = await fetch(`${API_URL}/api/admin/coupons/${couponId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.ok;
};

// ---- TOPLU İNDİRİM API FONKSİYONLARI ----
export const applyBulkDiscount = async (data: BulkDiscountDto): Promise<BulkDiscountResult> => {
  const token = getToken();
  if (!token) throw new Error('Yetkilendirme gerekli');

  try {
    const res = await fetch(`${API_URL}/api/admin/products/bulk-discount`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Toplu indirim uygulanırken hata oluştu');
    }

    return await res.json();
  } catch (error) {
    console.error('Toplu indirim uygulanırken hata:', error);
    throw error;
  }
};

export const removeBulkDiscount = async (data: RemoveBulkDiscountDto): Promise<BulkDiscountResult> => {
  const token = getToken();
  if (!token) throw new Error('Yetkilendirme gerekli');

  try {
    const res = await fetch(`${API_URL}/api/admin/products/remove-bulk-discount`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Toplu indirim kaldırılırken hata oluştu');
    }

    return await res.json();
  } catch (error) {
    console.error('Toplu indirim kaldırılırken hata:', error);
    throw error;
  }
};

export const getDiscountHistory = async (): Promise<DiscountHistory[]> => {
  const token = getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/api/admin/discount-history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('İndirim geçmişi alınırken hata:', error);
    return [];
  }
};