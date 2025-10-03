'use client';

import { useState } from 'react';
import { BulkDiscountDto } from '@/types';
import { Target, Calendar, Package, DollarSign, Zap, Flame, Star } from 'lucide-react';

interface DiscountTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  discount: {
    saleType: 'percentage' | 'amount';
    saleValue: number;
    saleLabel?: string;
    saleStartUtc?: string;
    saleEndUtc?: string;
  };
  filters: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    maxStockQuantity?: number;
    hasDiscount?: boolean;
    isFeatured?: boolean;
  };
}

const DISCOUNT_TEMPLATES: DiscountTemplate[] = [
  {
    id: 'season-end',
    name: 'Sezon Sonu İndirimi',
    description: 'Tüm ürünlere sezon sonu indirimi uygula',
    icon: <Calendar size={20} />,
    color: 'bg-orange-500',
    discount: {
      saleType: 'percentage',
      saleValue: 30,
      saleLabel: 'Sezon Sonu %30',
      saleStartUtc: new Date().toISOString(),
      saleEndUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
    },
    filters: {}
  },
  {
    id: 'stock-clearance',
    name: 'Stok Temizliği',
    description: 'Az stoklu ürünlere agresif indirim',
    icon: <Package size={20} />,
    color: 'bg-red-500',
    discount: {
      saleType: 'percentage',
      saleValue: 50,
      saleLabel: 'Stok Temizliği %50',
      saleStartUtc: new Date().toISOString(),
      saleEndUtc: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 gün sonra
    },
    filters: {
      maxStockQuantity: 5
    }
  },
  {
    id: 'new-year',
    name: 'Yılbaşı Kampanyası',
    description: 'Yılbaşı özel indirim kampanyası',
    icon: <Star size={20} />,
    color: 'bg-purple-500',
    discount: {
      saleType: 'percentage',
      saleValue: 25,
      saleLabel: 'Yılbaşı %25',
      saleStartUtc: new Date().toISOString(),
      saleEndUtc: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 gün sonra
    },
    filters: {}
  },
  {
    id: 'premium-clearance',
    name: 'Premium Temizlik',
    description: 'Yüksek fiyatlı ürünlere özel indirim',
    icon: <DollarSign size={20} />,
    color: 'bg-green-500',
    discount: {
      saleType: 'percentage',
      saleValue: 20,
      saleLabel: 'Premium %20',
      saleStartUtc: new Date().toISOString(),
      saleEndUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    filters: {
      minPrice: 300
    }
  },
  {
    id: 'flash-sale',
    name: 'Flaş İndirim',
    description: 'Kısa süreli hızlı satış indirimi',
    icon: <Zap size={20} />,
    color: 'bg-yellow-500',
    discount: {
      saleType: 'percentage',
      saleValue: 40,
      saleLabel: 'Flaş %40',
      saleStartUtc: new Date().toISOString(),
      saleEndUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün sonra
    },
    filters: {}
  },
  {
    id: 'featured-sale',
    name: 'Öne Çıkan Ürünler',
    description: 'Öne çıkan ürünlere özel indirim',
    icon: <Target size={20} />,
    color: 'bg-blue-500',
    discount: {
      saleType: 'percentage',
      saleValue: 15,
      saleLabel: 'Öne Çıkan %15',
      saleStartUtc: new Date().toISOString(),
      saleEndUtc: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 gün sonra
    },
    filters: {
      isFeatured: true
    }
  }
];

interface DiscountTemplatesProps {
  onTemplateSelect: (template: DiscountTemplate) => void;
  onCustomDiscount: () => void;
}

export default function DiscountTemplates({ onTemplateSelect, onCustomDiscount }: DiscountTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateClick = (template: DiscountTemplate) => {
    setSelectedTemplate(template.id);
    onTemplateSelect(template);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">İndirim Şablonları</h3>
        <p className="text-sm text-gray-600">Hazır şablonlardan birini seçin veya özel indirim oluşturun</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DISCOUNT_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg text-white ${template.color}`}>
                {template.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">İndirim:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.discount.saleType === 'percentage' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {template.discount.saleType === 'percentage' 
                        ? `%${template.discount.saleValue}`
                        : `${template.discount.saleValue}₺`
                      }
                    </span>
                  </div>
                  
                  {template.discount.saleLabel && (
                    <div className="text-xs text-gray-500">
                      Etiket: {template.discount.saleLabel}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {formatDate(template.discount.saleStartUtc!)} - {formatDate(template.discount.saleEndUtc!)}
                  </div>
                  
                  {Object.keys(template.filters).length > 0 && (
                    <div className="text-xs text-gray-500">
                      Filtreler: {Object.entries(template.filters)
                        .filter(([_, value]) => value !== undefined)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onCustomDiscount}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
        >
          <Target size={16} />
          Özel İndirim Oluştur
        </button>
      </div>
    </div>
  );
}
