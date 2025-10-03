'use client';

import { useEffect, useState } from 'react';
import { DiscountHistory } from '@/types';
import { getDiscountHistory } from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar, 
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DiscountAnalytics {
  totalDiscounts: number;
  totalSavings: number;
  averageDiscount: number;
  mostDiscountedCategory: string;
  discountTrend: Array<{
    date: string;
    applied: number;
    removed: number;
    totalSavings: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    totalSavings: number;
  }>;
  topProducts: Array<{
    productName: string;
    discountCount: number;
    totalSavings: number;
  }>;
}

export default function DiscountAnalyticsPage() {
  const [history, setHistory] = useState<DiscountHistory[]>([]);
  const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getDiscountHistory();
      setHistory(data);
      
      // Analitik hesaplamaları
      const analytics = calculateAnalytics(data, dateRange);
      setAnalytics(analytics);
      setLoading(false);
    };
    fetchData();
  }, [dateRange]);

  const calculateAnalytics = (data: DiscountHistory[], range: string): DiscountAnalytics => {
    const now = new Date();
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const filteredData = data.filter(item => new Date(item.createdAt) >= startDate);
    
    const appliedDiscounts = filteredData.filter(item => item.action === 'APPLIED');
    const totalDiscounts = appliedDiscounts.length;
    const totalSavings = appliedDiscounts.reduce((sum, item) => sum + (item.oldPrice - item.newPrice), 0);
    const averageDiscount = totalDiscounts > 0 ? totalSavings / totalDiscounts : 0;
    
    // Kategori analizi
    const categoryMap = new Map<string, { count: number; savings: number }>();
    appliedDiscounts.forEach(item => {
      // Bu örnekte kategori bilgisini productName'den çıkarıyoruz
      // Gerçek uygulamada product.categoryName kullanılmalı
      const category = 'Genel'; // item.productName.split(' ')[0]; // Basit kategori çıkarımı
      const existing = categoryMap.get(category) || { count: 0, savings: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        savings: existing.savings + (item.oldPrice - item.newPrice)
      });
    });
    
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      totalSavings: data.savings
    })).sort((a, b) => b.totalSavings - a.totalSavings);
    
    // Ürün analizi
    const productMap = new Map<string, { count: number; savings: number }>();
    appliedDiscounts.forEach(item => {
      const existing = productMap.get(item.productName) || { count: 0, savings: 0 };
      productMap.set(item.productName, {
        count: existing.count + 1,
        savings: existing.savings + (item.oldPrice - item.newPrice)
      });
    });
    
    const topProducts = Array.from(productMap.entries()).map(([productName, data]) => ({
      productName,
      discountCount: data.count,
      totalSavings: data.savings
    })).sort((a, b) => b.totalSavings - a.totalSavings).slice(0, 10);
    
    // Günlük trend analizi
    const trendMap = new Map<string, { applied: number; removed: number; savings: number }>();
    filteredData.forEach(item => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      const existing = trendMap.get(date) || { applied: 0, removed: 0, savings: 0 };
      if (item.action === 'APPLIED') {
        existing.applied++;
        existing.savings += (item.oldPrice - item.newPrice);
      } else if (item.action === 'REMOVED') {
        existing.removed++;
      }
      trendMap.set(date, existing);
    });
    
    const discountTrend = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      applied: data.applied,
      removed: data.removed,
      totalSavings: data.savings
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalDiscounts,
      totalSavings,
      averageDiscount,
      mostDiscountedCategory: categoryBreakdown[0]?.category || 'N/A',
      discountTrend,
      categoryBreakdown,
      topProducts
    };
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) return <p>Analitikler yükleniyor...</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={24} />
          İndirim Analitikleri
        </h1>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
          <option value="1y">Son 1 Yıl</option>
        </select>
      </div>

      {analytics && (
        <>
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingDown className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam İndirim</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.totalDiscounts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Tasarruf</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(analytics.totalSavings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ortalama İndirim</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(analytics.averageDiscount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">En Çok İndirimli Kategori</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.mostDiscountedCategory}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kategori Dağılımı */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart size={20} />
                Kategori Dağılımı
              </h3>
              <div className="space-y-3">
                {analytics.categoryBreakdown.slice(0, 5).map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.count} indirim</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.totalSavings)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* En Çok İndirimli Ürünler */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={20} />
                En Çok İndirimli Ürünler
              </h3>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 5).map((item, index) => (
                  <div key={item.productName} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate max-w-32">{item.productName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.discountCount} kez</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.totalSavings)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trend Grafiği */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              İndirim Trendi
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tarih</th>
                    <th className="text-right py-2">Uygulanan</th>
                    <th className="text-right py-2">Kaldırılan</th>
                    <th className="text-right py-2">Toplam Tasarruf</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.discountTrend.slice(-10).map((item) => (
                    <tr key={item.date} className="border-b">
                      <td className="py-2">{formatDate(item.date)}</td>
                      <td className="text-right py-2 text-green-600">{item.applied}</td>
                      <td className="text-right py-2 text-red-600">{item.removed}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(item.totalSavings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
