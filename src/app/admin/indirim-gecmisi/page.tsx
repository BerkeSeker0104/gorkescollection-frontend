'use client';

import { useEffect, useState } from 'react';
import { DiscountHistory } from '@/types';
import { getDiscountHistory } from '@/lib/api';
import { History, TrendingUp, TrendingDown, Calendar, Package, DollarSign } from 'lucide-react';

export default function DiscountHistoryPage() {
  const [history, setHistory] = useState<DiscountHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'APPLIED' | 'REMOVED' | 'UPDATED'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await getDiscountHistory();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.action === filter
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPLIED':
        return <TrendingDown className="text-green-600" size={16} />;
      case 'REMOVED':
        return <TrendingUp className="text-red-600" size={16} />;
      case 'UPDATED':
        return <Package className="text-blue-600" size={16} />;
      default:
        return <History className="text-gray-600" size={16} />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'APPLIED':
        return 'İndirim Uygulandı';
      case 'REMOVED':
        return 'İndirim Kaldırıldı';
      case 'UPDATED':
        return 'İndirim Güncellendi';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPLIED':
        return 'bg-green-100 text-green-800';
      case 'REMOVED':
        return 'bg-red-100 text-red-800';
      case 'UPDATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    });
  };

  if (loading) return <p>İndirim geçmişi yükleniyor...</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <History size={24} />
          İndirim Geçmişi
        </h1>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="all">Tümü</option>
            <option value="APPLIED">İndirim Uygulanan</option>
            <option value="REMOVED">İndirim Kaldırılan</option>
            <option value="UPDATED">Güncellenen</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Henüz indirim geçmişi bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İndirim Detayı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat Değişimi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(item.action)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                          {getActionText(item.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {item.productId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {item.action === 'APPLIED' ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={14} />
                              <span>
                                {item.saleType === 'percentage' 
                                  ? `%${item.saleValue} İndirim`
                                  : `${formatPrice(item.saleValue)} İndirim`
                                }
                              </span>
                            </div>
                            {item.saleLabel && (
                              <div className="text-xs text-gray-500 mt-1">
                                Etiket: {item.saleLabel}
                              </div>
                            )}
                            {item.saleStartUtc && (
                              <div className="text-xs text-gray-500 mt-1">
                                <Calendar size={12} className="inline mr-1" />
                                {formatDate(item.saleStartUtc)} - {item.saleEndUtc ? formatDate(item.saleEndUtc) : 'Süresiz'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            İndirim bilgileri kaldırıldı
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through">
                            {formatPrice(item.oldPrice)}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`font-medium ${
                            item.newPrice < item.oldPrice ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {formatPrice(item.newPrice)}
                          </span>
                        </div>
                        {item.newPrice < item.oldPrice && (
                          <div className="text-xs text-green-600 mt-1">
                            {formatPrice(item.oldPrice - item.newPrice)} tasarruf
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* İstatistikler */}
      {history.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="text-green-600" size={20} />
              <span className="text-sm font-medium text-gray-600">Toplam İndirim Uygulama</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {history.filter(h => h.action === 'APPLIED').length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20} />
              <span className="text-sm font-medium text-gray-600">Toplam İndirim Kaldırma</span>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {history.filter(h => h.action === 'REMOVED').length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-gray-600">Toplam İşlem</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {history.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
