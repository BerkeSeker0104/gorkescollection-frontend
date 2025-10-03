'use client';

import { useState, useRef } from 'react';
import { Product, Category } from '@/types';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

interface BulkImportExportProps {
  products: Product[];
  categories: Category[];
  onImportComplete: (result: ImportResult) => void;
  onExportRequest: (format: 'csv' | 'excel') => void;
}

export default function BulkImportExport({ 
  products, 
  categories, 
  onImportComplete, 
  onExportRequest 
}: BulkImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType || '')) {
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: ['Desteklenmeyen dosya formatı. Lütfen CSV veya Excel dosyası seçin.'],
        warnings: []
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    // Simüle edilmiş import işlemi
    setTimeout(() => {
      const result: ImportResult = {
        success: true,
        imported: Math.floor(Math.random() * 50) + 10,
        failed: Math.floor(Math.random() * 5),
        errors: [],
        warnings: [
          'Bazı ürünlerde eksik bilgiler tespit edildi.',
          '3 ürün için geçersiz kategori ID kullanıldı.'
        ]
      };
      
      setImportResult(result);
      setIsImporting(false);
      onImportComplete(result);
    }, 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    // CSV template oluştur
    const headers = [
      'SKU', 'Name', 'Description', 'Price', 'StockQuantity', 'CategoryId', 
      'IsFeatured', 'SaleType', 'SaleValue', 'SaleLabel', 'SaleStartUtc', 'SaleEndUtc'
    ];
    
    const sampleData = [
      [
        'SKU001', 'Örnek Ürün 1', 'Ürün açıklaması', '100.00', '50', '1',
        'true', 'percentage', '20', 'İndirim', '2024-01-01T00:00:00Z', '2024-12-31T23:59:59Z'
      ],
      [
        'SKU002', 'Örnek Ürün 2', 'Ürün açıklaması', '200.00', '25', '2',
        'false', 'amount', '50', 'Flaş İndirim', '', ''
      ]
    ];
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'urun_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProducts = (format: 'csv' | 'excel') => {
    onExportRequest(format);
    
    // Simüle edilmiş export işlemi
    const csvContent = [
      ['SKU', 'Name', 'Price', 'Stock', 'Category', 'Sale Type', 'Sale Value'],
      ...products.map(product => [
        product.sku || '',
        product.name,
        product.price.toString(),
        product.stockQuantity.toString(),
        product.categoryName,
        product.saleType || '',
        product.saleValue?.toString() || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `urunler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Import Bölümü */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} />
          Toplu İçe Aktarma
        </h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {isImporting ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Dosya işleniyor...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload size={48} className="mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Dosyayı buraya sürükleyin veya
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  dosya seçin
                </button>
              </div>
              <p className="text-sm text-gray-500">
                CSV, XLSX veya XLS formatında dosya yükleyebilirsiniz
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <FileText size={16} />
            Şablon İndir
          </button>
        </div>

        {/* Import Sonuçları */}
        {importResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {importResult.success ? (
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">
                  {importResult.success ? 'İçe Aktarma Tamamlandı' : 'İçe Aktarma Başarısız'}
                </h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Başarılı: {importResult.imported} ürün
                  </p>
                  {importResult.failed > 0 && (
                    <p className="text-sm text-red-600">
                      Başarısız: {importResult.failed} ürün
                    </p>
                  )}
                </div>
                
                {importResult.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800">Uyarılar:</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      {importResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-800">Hatalar:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setImportResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Bölümü */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download size={20} />
          Toplu Dışa Aktarma
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => exportProducts('csv')}
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={24} className="text-green-600" />
              <div className="text-left">
                <p className="font-medium">CSV Formatında</p>
                <p className="text-sm text-gray-600">Excel'de açılabilir</p>
              </div>
            </button>
            
            <button
              onClick={() => exportProducts('excel')}
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={24} className="text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Excel Formatında</p>
                <p className="text-sm text-gray-600">Gelişmiş formatlama</p>
              </div>
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>• Toplam {products.length} ürün dışa aktarılacak</p>
            <p>• İndirim bilgileri ve stok durumu dahil</p>
            <p>• Kategori ve özellik bilgileri dahil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
