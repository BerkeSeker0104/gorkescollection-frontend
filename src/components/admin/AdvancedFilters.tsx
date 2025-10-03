'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { Filter, X, Search, Target, Package, DollarSign, Calendar } from 'lucide-react';

interface AdvancedFiltersProps {
  categories: Category[];
  onFiltersChange: (filters: AdvancedFilterState) => void;
  initialFilters?: AdvancedFilterState;
}

export interface AdvancedFilterState {
  // Temel filtreler
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  maxStockQuantity?: number;
  
  // Gelişmiş filtreler
  hasDiscount?: boolean;
  isFeatured?: boolean;
  material?: string;
  color?: string;
  size?: string;
  brand?: string;
  
  // Tarih filtreleri
  createdAfter?: string;
  createdBefore?: string;
  lastModifiedAfter?: string;
  lastModifiedBefore?: string;
  
  // Stok durumu
  stockStatus?: 'inStock' | 'lowStock' | 'outOfStock' | 'all';
  
  // Fiyat aralığı kategorileri
  priceRange?: 'budget' | 'mid' | 'premium' | 'luxury' | 'all';
}

const MATERIALS = [
  'Paslanmaz Çelik',
  'Altın Kaplama',
  'Gümüş',
  'Titanyum',
  'Rose Gold',
  'White Gold'
];

const COLORS = [
  'Altın',
  'Gümüş',
  'Rose Gold',
  'White Gold',
  'Siyah',
  'Beyaz',
  'Renkli'
];

const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL'
];

const BRANDS = [
  'Gorkes Collection',
  'Premium',
  'Classic',
  'Modern'
];

export default function AdvancedFilters({ categories, onFiltersChange, initialFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilterState>(initialFilters || {});

  const handleFilterChange = (key: keyof AdvancedFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: AdvancedFilterState = {};
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && value !== 'all'
    ).length;
  };

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case 'budget': return 'Ekonomik (0-100₺)';
      case 'mid': return 'Orta (100-300₺)';
      case 'premium': return 'Premium (300-500₺)';
      case 'luxury': return 'Lüks (500₺+)';
      default: return 'Tümü';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'inStock': return 'Stokta Var';
      case 'lowStock': return 'Az Stok (≤5)';
      case 'outOfStock': return 'Tükendi';
      default: return 'Tümü';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <h3 className="font-semibold">Gelişmiş Filtreler</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()} aktif
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X size={14} />
                Temizle
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isOpen ? 'Gizle' : 'Göster'}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Temel Filtreler */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package size={16} />
              Temel Filtreler
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fiyat Aralığı</label>
                <select
                  value={filters.priceRange || 'all'}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Tümü</option>
                  <option value="budget">Ekonomik (0-100₺)</option>
                  <option value="mid">Orta (100-300₺)</option>
                  <option value="premium">Premium (300-500₺)</option>
                  <option value="luxury">Lüks (500₺+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Min Fiyat (₺)</label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Fiyat (₺)</label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Stok Miktarı</label>
                <input
                  type="number"
                  value={filters.maxStockQuantity || ''}
                  onChange={(e) => handleFilterChange('maxStockQuantity', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stok Durumu</label>
                <select
                  value={filters.stockStatus || 'all'}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Tümü</option>
                  <option value="inStock">Stokta Var</option>
                  <option value="lowStock">Az Stok (≤5)</option>
                  <option value="outOfStock">Tükendi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ürün Özellikleri */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Target size={16} />
              Ürün Özellikleri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Malzeme</label>
                <select
                  value={filters.material || ''}
                  onChange={(e) => handleFilterChange('material', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Tüm Malzemeler</option>
                  {MATERIALS.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Renk</label>
                <select
                  value={filters.color || ''}
                  onChange={(e) => handleFilterChange('color', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Tüm Renkler</option>
                  {COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Boyut</label>
                <select
                  value={filters.size || ''}
                  onChange={(e) => handleFilterChange('size', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Tüm Boyutlar</option>
                  {SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Marka</label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Tüm Markalar</option>
                  {BRANDS.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Durum Filtreleri */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign size={16} />
              Durum Filtreleri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasDiscount || false}
                    onChange={(e) => handleFilterChange('hasDiscount', e.target.checked || undefined)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">İndirimli Ürünler</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured || false}
                    onChange={(e) => handleFilterChange('isFeatured', e.target.checked || undefined)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Öne Çıkan Ürünler</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tarih Filtreleri */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Tarih Filtreleri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Oluşturulma Tarihi (Başlangıç)</label>
                <input
                  type="date"
                  value={filters.createdAfter || ''}
                  onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Oluşturulma Tarihi (Bitiş)</label>
                <input
                  type="date"
                  value={filters.createdBefore || ''}
                  onChange={(e) => handleFilterChange('createdBefore', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Son Güncelleme (Başlangıç)</label>
                <input
                  type="date"
                  value={filters.lastModifiedAfter || ''}
                  onChange={(e) => handleFilterChange('lastModifiedAfter', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Son Güncelleme (Bitiş)</label>
                <input
                  type="date"
                  value={filters.lastModifiedBefore || ''}
                  onChange={(e) => handleFilterChange('lastModifiedBefore', e.target.value || undefined)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
