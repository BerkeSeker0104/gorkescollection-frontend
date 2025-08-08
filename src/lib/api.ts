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
} from '@/types';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => Cookies.get('token');

/* ------------------------------------------------------------------------- */
/* HERKESE AÇIK FONKSİYONLAR                                                */
/* ------------------------------------------------------------------------- */

// api.ts
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
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/api/account/addresses`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });
    return res.ok;
  } catch (error) {
    console.error('Adres güncellenirken ağ hatası:', error);
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

export const loginUser = async (data: LoginData): Promise<{user: UserDto | null, error?: string}> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      // Unauthorized hatasını özel olarak yakala
      if (response.status === 401) {
          return { user: null, error: errorText };
      }
      console.error('Giriş API hatası:', response.status, errorText);
      return { user: null, error: 'Sunucu hatası oluştu.' };
    }
    return { user: await response.json(), error: undefined };
  } catch (error) {
    console.error('Giriş sırasında ağ/fetch hatası:', error);
    return { user: null, error: 'Sunucuya ulaşılamadı.' };
  }
};

// --- GÜNCELLENDİ: registerUser fonksiyonu artık mesaj döndürüyor ---
export const registerUser = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();

    if (!response.ok) {
        // Model doğrulama hatalarını birleştir
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

/* ------------------------------------------------------------------------- */
/* SEPET & SİPARİŞ                                                          */
/* ------------------------------------------------------------------------- */

export const getCart = async (): Promise<CartDto | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (response.status === 404) return null;
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Sepet alınırken ağ hatası:', error);
    return null;
  }
};

export const addToCart = async (productId: number, quantity: number): Promise<CartDto | null> => {
  const token = getToken();
  if (!token) {
    alert('Lütfen önce giriş yapın.');
    return null;
  }
  try {
    const response = await fetch(
      `${API_URL}/api/cart/items?productId=${productId}&quantity=${quantity}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Sepete eklerken ağ hatası:', error);
    return null;
  }
};

export const removeFromCart = async (productId: number, quantity: number): Promise<CartDto | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await fetch(
      `${API_URL}/api/cart/items?productId=${productId}&quantity=${quantity}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) return null;
    return await getCart();
  } catch (error) {
    console.error('Sepetten çıkarırken ağ hatası:', error);
    return null;
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
  const token = getToken();
  if (!token) {
    console.error('Cloudinary imzası için token bulunamadı.');
    return null;
  }
  try {
    const response = await fetch(`${API_URL}/api/admin/upload-signature`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error(
        'Cloudinary imzası alınamadı. Sunucu cevabı:',
        response.status,
        await response.text()
      );
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Cloudinary imzası alınırken bir ağ hatası oluştu:', error);
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
