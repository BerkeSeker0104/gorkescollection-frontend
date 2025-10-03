'use client';

import { useEffect, useState } from 'react';
import { Product, Category, BulkDiscountDto, BulkDiscountResult } from '@/types';
import { getAllProducts, getCategories, applyBulkDiscount, removeBulkDiscount } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X, Filter, Target, Package, DollarSign, BarChart3, Upload, Download, Bell } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import AdvancedFilters, { AdvancedFilterState } from '@/components/admin/AdvancedFilters';
import DiscountTemplates from '@/components/admin/DiscountTemplates';
import BulkImportExport from '@/components/admin/BulkImportExport';
import DiscountNotifications from '@/components/admin/DiscountNotifications';

const bulkDiscountSchema = z.object({
  saleType: z.enum(['percentage', 'amount']),
  saleValue: z.number().min(0.01, 'İndirim değeri 0\'dan büyük olmalı'),
  saleStartUtc: z.string().optional(),
  saleEndUtc: z.string().optional(),
  saleLabel: z.string().optional(),
  // Filtreleme kriterleri
  categoryId: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  maxStockQuantity: z.number().optional(),
});

type BulkDiscountFormData = z.infer<typeof bulkDiscountSchema>;

export default function BulkDiscountPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<BulkDiscountResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'discount' | 'templates' | 'filters' | 'import' | 'notifications'>('discount');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({});

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BulkDiscountFormData>({
    resolver: zodResolver(bulkDiscountSchema),
    defaultValues: {
      saleType: 'percentage',
      saleValue: 20,
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getAllProducts(),
        getCategories(),
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setFilteredProducts(fetchedProducts);
      
      // URL'den seçili ürünleri al
      const selectedParam = searchParams.get('selected');
      if (selectedParam) {
        const selectedIds = selectedParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        setSelectedProducts(selectedIds);
      }
      
      setLoading(false);
    };
    fetchData();
  }, [searchParams]);

  // Gelişmiş filtreleme logic'i
  useEffect(() => {
    let filtered = [...products];

    // Temel filtreler
    if (watchedValues.categoryId) {
      filtered = filtered.filter(p => p.categoryId === watchedValues.categoryId);
    }

    if (watchedValues.minPrice) {
      filtered = filtered.filter(p => p.price >= watchedValues.minPrice!);
    }

    if (watchedValues.maxPrice) {
      filtered = filtered.filter(p => p.price <= watchedValues.maxPrice!);
    }

    if (watchedValues.maxStockQuantity) {
      filtered = filtered.filter(p => p.stockQuantity <= watchedValues.maxStockQuantity!);
    }

    // Gelişmiş filtreler
    if (advancedFilters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === advancedFilters.categoryId);
    }

    if (advancedFilters.minPrice) {
      filtered = filtered.filter(p => p.price >= advancedFilters.minPrice!);
    }

    if (advancedFilters.maxPrice) {
      filtered = filtered.filter(p => p.price <= advancedFilters.maxPrice!);
    }

    if (advancedFilters.maxStockQuantity) {
      filtered = filtered.filter(p => p.stockQuantity <= advancedFilters.maxStockQuantity!);
    }

    if (advancedFilters.hasDiscount) {
      filtered = filtered.filter(p => p.saleType && p.saleValue);
    }

    if (advancedFilters.isFeatured) {
      filtered = filtered.filter(p => p.isFeatured);
    }

    if (advancedFilters.stockStatus === 'inStock') {
      filtered = filtered.filter(p => p.stockQuantity > 0);
    } else if (advancedFilters.stockStatus === 'lowStock') {
      filtered = filtered.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5);
    } else if (advancedFilters.stockStatus === 'outOfStock') {
      filtered = filtered.filter(p => p.stockQuantity === 0);
    }

    setFilteredProducts(filtered);
  }, [products, watchedValues, advancedFilters]);

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const onSubmit = async (data: BulkDiscountFormData) => {
    if (selectedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin.');
      return;
    }

    setIsApplying(true);
    setResult(null);

    try {
      const payload: BulkDiscountDto = {
        productIds: selectedProducts,
        saleType: data.saleType,
        saleValue: data.saleValue,
        saleStartUtc: data.saleStartUtc || undefined,
        saleEndUtc: data.saleEndUtc || undefined,
        saleLabel: data.saleLabel || undefined,
        categoryId: data.categoryId || undefined,
        minPrice: data.minPrice || undefined,
        maxPrice: data.maxPrice || undefined,
        maxStockQuantity: data.maxStockQuantity || undefined,
      };

      const result = await applyBulkDiscount(payload);
      setResult(result);
      
      if (result.success) {
        // Başarılı olursa seçili ürünleri temizle
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Toplu indirim uygulanırken hata:', error);
      setResult({
        success: false,
        updatedCount: 0,
        failedCount: 0,
        message: 'Toplu indirim uygulanırken hata oluştu.',
        errors: [error instanceof Error ? error.message : 'Bilinmeyen hata']
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (selectedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin.');
      return;
    }

    if (!confirm('Seçili ürünlerden indirimleri kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    setIsApplying(true);
    setResult(null);

    try {
      const result = await removeBulkDiscount({ productIds: selectedProducts });
      setResult(result);
      
      if (result.success) {
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Toplu indirim kaldırılırken hata:', error);
      setResult({
        success: false,
        updatedCount: 0,
        failedCount: 0,
        message: 'Toplu indirim kaldırılırken hata oluştu.',
        errors: [error instanceof Error ? error.message : 'Bilinmeyen hata']
      });
    } finally {
      setIsApplying(false);
    }
  };

  const calculateNewPrice = (originalPrice: number, saleType: string, saleValue: number) => {
    if (saleType === 'percentage') {
      return originalPrice * (1 - saleValue / 100);
    } else {
      return Math.max(0, originalPrice - saleValue);
    }
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gelişmiş Toplu İndirim Yönetimi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            <BarChart3 size={16} />
            Analitikler
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'discount', label: 'İndirim Uygula', icon: Target },
            { id: 'templates', label: 'Şablonlar', icon: Package },
            { id: 'filters', label: 'Gelişmiş Filtreler', icon: Filter },
            { id: 'import', label: 'İçe/Dışa Aktar', icon: Upload },
            { id: 'notifications', label: 'Bildirimler', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <DiscountTemplates
          onTemplateSelect={(template) => {
            setValue('saleType', template.discount.saleType);
            setValue('saleValue', template.discount.saleValue);
            setValue('saleLabel', template.discount.saleLabel);
            setValue('saleStartUtc', template.discount.saleStartUtc);
            setValue('saleEndUtc', template.discount.saleEndUtc);
            setActiveTab('discount');
          }}
          onCustomDiscount={() => setActiveTab('discount')}
        />
      )}

      {activeTab === 'filters' && (
        <AdvancedFilters
          categories={categories}
          onFiltersChange={setAdvancedFilters}
          initialFilters={advancedFilters}
        />
      )}

      {activeTab === 'import' && (
        <BulkImportExport
          products={products}
          categories={categories}
          onImportComplete={(result) => {
            console.log('Import result:', result);
            // Import sonucunu işle
          }}
          onExportRequest={(format) => {
            console.log('Export requested:', format);
            // Export işlemini başlat
          }}
        />
      )}

      {activeTab === 'notifications' && (
        <DiscountNotifications
          onSendNotification={(template, recipients) => {
            console.log('Notification sent:', template, recipients);
            // Bildirim gönderim işlemini başlat
          }}
        />
      )}

      {activeTab === 'discount' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel: Filtreler ve Ürün Listesi */}
          <div className="lg:col-span-2">
            {/* Gelişmiş Filtreler */}
            <AdvancedFilters
              categories={categories}
              onFiltersChange={setAdvancedFilters}
              initialFilters={advancedFilters}
            />

          {/* Ürün Listesi */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Ürünler ({filteredProducts.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {selectedProducts.length === filteredProducts.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} seçili
                </span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`p-4 border-b flex items-center gap-4 hover:bg-gray-50 ${
                    selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.price.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">Stok: {product.stockQuantity}</p>
                  </div>
                  {selectedProducts.includes(product.id) && watchedValues.saleType && watchedValues.saleValue && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        Yeni Fiyat: {calculateNewPrice(product.price, watchedValues.saleType, watchedValues.saleValue).toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Panel: İndirim Formu */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target size={20} />
              İndirim Ayarları
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">İndirim Tipi</label>
              <select {...register('saleType')} className="w-full border rounded px-3 py-2">
                <option value="percentage">Yüzde (%)</option>
                <option value="amount">Tutar (₺)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                İndirim Değeri {watchedValues.saleType === 'percentage' ? '(%)' : '(₺)'}
              </label>
              <input
                type="number"
                step={watchedValues.saleType === 'percentage' ? '1' : '0.01'}
                {...register('saleValue', { setValueAs: (v) => Number(v) })}
                className="w-full border rounded px-3 py-2"
                placeholder={watchedValues.saleType === 'percentage' ? '20' : '50'}
              />
              {errors.saleValue && (
                <p className="text-red-600 text-sm mt-1">{errors.saleValue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İndirim Etiketi (Opsiyonel)</label>
              <input
                type="text"
                {...register('saleLabel')}
                className="w-full border rounded px-3 py-2"
                placeholder="Sezon Sonu, Yılbaşı İndirimi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
                <input
                  type="datetime-local"
                  {...register('saleStartUtc')}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                <input
                  type="datetime-local"
                  {...register('saleEndUtc')}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isApplying || selectedProducts.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isApplying ? 'Uygulanıyor...' : 'İndirim Uygula'}
                <Target size={16} />
              </button>

              <button
                type="button"
                onClick={handleRemoveDiscount}
                disabled={isApplying || selectedProducts.length === 0}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isApplying ? 'Kaldırılıyor...' : 'İndirimleri Kaldır'}
                <X size={16} />
              </button>
            </div>
          </form>

          {/* Sonuç Gösterimi */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? <Check size={20} /> : <X size={20} />}
                <span className="font-semibold">
                  {result.success ? 'Başarılı' : 'Hata'}
                </span>
              </div>
              <p className="text-sm">{result.message}</p>
              {result.updatedCount > 0 && (
                <p className="text-sm mt-1">
                  Güncellenen: {result.updatedCount} ürün
                </p>
              )}
              {result.failedCount > 0 && (
                <p className="text-sm mt-1">
                  Başarısız: {result.failedCount} ürün
                </p>
              )}
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Hatalar:</p>
                  <ul className="text-xs list-disc list-inside">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
