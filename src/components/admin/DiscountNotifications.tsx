'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Users, Send, CheckCircle } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  subject: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'discount-announcement',
    name: 'İndirim Duyurusu',
    type: 'email',
    subject: '🎉 Özel İndirim Fırsatı!',
    message: 'Sevgili müşterimiz, size özel indirim fırsatlarımızı kaçırmayın!',
    icon: <Mail size={20} />,
    color: 'bg-blue-500'
  },
  {
    id: 'flash-sale',
    name: 'Flaş İndirim',
    type: 'sms',
    subject: '⚡ Flaş İndirim!',
    message: 'Sadece bugün! %50\'ye varan indirimler. Hemen alışverişe başla!',
    icon: <Smartphone size={20} />,
    color: 'bg-yellow-500'
  },
  {
    id: 'season-end',
    name: 'Sezon Sonu',
    type: 'whatsapp',
    subject: '🏷️ Sezon Sonu İndirimleri',
    message: 'Sezon sonu indirimleri başladı! Favori ürünlerinizi kaçırmayın.',
    icon: <MessageSquare size={20} />,
    color: 'bg-green-500'
  },
  {
    id: 'stock-clearance',
    name: 'Stok Temizliği',
    type: 'push',
    subject: '📦 Stok Temizliği',
    message: 'Sınırlı stok! Özel fiyatlarla son fırsatlar.',
    icon: <Bell size={20} />,
    color: 'bg-red-500'
  }
];

interface DiscountNotificationsProps {
  onSendNotification: (template: NotificationTemplate, recipients: string[]) => void;
}

export default function DiscountNotifications({ onSendNotification }: DiscountNotificationsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [recipients, setRecients] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Simüle edilmiş müşteri listesi
  const [customers] = useState([
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', phone: '+905551234567' },
    { id: 2, name: 'Ayşe Demir', email: 'ayse@example.com', phone: '+905559876543' },
    { id: 3, name: 'Mehmet Kaya', email: 'mehmet@example.com', phone: '+905556543210' },
    { id: 4, name: 'Fatma Öz', email: 'fatma@example.com', phone: '+905551357924' },
    { id: 5, name: 'Ali Veli', email: 'ali@example.com', phone: '+905559753186' }
  ]);

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setCustomMessage(template.message);
  };

  const handleRecipientToggle = (customerId: number) => {
    setRecients(prev => 
      prev.includes(customerId.toString()) 
        ? prev.filter(id => id !== customerId.toString())
        : [...prev, customerId.toString()]
    );
  };

  const handleSelectAll = () => {
    if (recipients.length === customers.length) {
      setRecients([]);
    } else {
      setRecients(customers.map(c => c.id.toString()));
    }
  };

  const handleSend = async () => {
    if (!selectedTemplate || recipients.length === 0) {
      setSendResult({ success: false, message: 'Lütfen şablon seçin ve en az bir alıcı belirleyin.' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    // Simüle edilmiş gönderim
    setTimeout(() => {
      const success = Math.random() > 0.1; // %90 başarı oranı
      setSendResult({
        success,
        message: success 
          ? `${recipients.length} kişiye başarıyla gönderildi.`
          : 'Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      });
      setIsSending(false);
      
      if (success) {
        onSendNotification(selectedTemplate, recipients);
        setRecients([]);
        setSelectedTemplate(null);
        setCustomMessage('');
      }
    }, 2000);
  };

  const getRecipientCount = () => {
    return recipients.length;
  };

  const getTotalCustomers = () => {
    return customers.length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">İndirim Bildirimleri</h3>
        <p className="text-sm text-gray-600">Müşterilerinize özel indirim duyuruları gönderin</p>
      </div>

      {/* Şablon Seçimi */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="font-medium mb-4">Bildirim Şablonu Seçin</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NOTIFICATION_TEMPLATES.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white ${template.color}`}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{template.name}</h5>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alıcı Seçimi */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Alıcı Seçimi</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {getRecipientCount()} / {getTotalCustomers()} seçili
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {recipients.length === customers.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
            </button>
          </div>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                recipients.includes(customer.id.toString())
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleRecipientToggle(customer.id)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={recipients.includes(customer.id.toString())}
                  onChange={() => handleRecipientToggle(customer.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {customer.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mesaj Düzenleme */}
      {selectedTemplate && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-4">Mesaj İçeriği</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konu</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                className="w-full border rounded px-3 py-2"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mesaj</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="w-full border rounded px-3 py-2"
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Gönderim Butonu */}
      {selectedTemplate && recipients.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Gönderim Özeti</h4>
              <p className="text-sm text-gray-600">
                {selectedTemplate.name} şablonu ile {recipients.length} kişiye gönderilecek
              </p>
            </div>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Gönder
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Sonuç Gösterimi */}
      {sendResult && (
        <div className={`p-4 rounded-lg ${
          sendResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {sendResult.success ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            )}
            <div>
              <p className={`font-medium ${
                sendResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {sendResult.success ? 'Başarılı' : 'Hata'}
              </p>
              <p className={`text-sm ${
                sendResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {sendResult.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
