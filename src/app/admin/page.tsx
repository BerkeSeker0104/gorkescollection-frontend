'use client';

import Link from 'next/link';
// Ticket ikonunu import ediyoruz
import { Package, ShoppingCart, Users, Layers, Settings, Ticket } from 'lucide-react';
import type { ElementType } from 'react';

// DashboardCard'ın alacağı özelliklerin tiplerini tanımlıyoruz.
interface DashboardCardProps {
    title: string;
    description: string;
    link: string;
    icon: ElementType;
}

// Admin panelindeki her bir bölüm için bir kart oluşturan bileşen
const DashboardCard = ({ title, description, link, icon: Icon }: DashboardCardProps) => {
    return (
        <Link href={link}>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                        <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                </div>
                <p className="mt-4 text-sm text-gray-600 flex-grow">{description}</p>
                <div className="mt-4 text-right text-sm font-medium text-blue-600 hover:text-blue-500">
                    Yönet &rarr;
                </div>
            </div>
        </Link>
    );
};


export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Paneli</h1>
            <p className="text-gray-600 mb-8">Nazar Duası - Euzu bi kelimatillâhi't-tâmmeti min kulli şeytanin ve hammetin ve min külli aynin lammeh - 
                Bereket Duası - Allâhümmekfinî bi helâlike an harâmike, veğninî bi fadlike ammen sivâke.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard 
                    title="Ürün Yönetimi"
                    description="Yeni ürünler ekle, mevcut ürünleri düzenle, stok ve fiyat bilgilerini güncelle."
                    link="/admin/urunler"
                    icon={Package}
                />
                <DashboardCard 
                    title="Kategori Yönetimi"
                    description="Ürün kategorilerini oluştur, düzenle ve sil. Ürünleri doğru kategorilere ata."
                    link="/admin/kategoriler"
                    icon={Layers}
                />
                <DashboardCard 
                    title="Sipariş Yönetimi"
                    description="Gelen siparişleri görüntüle, kargo durumlarını güncelle ve müşteri bilgilerini takip et."
                    link="/admin/siparisler"
                    icon={ShoppingCart}
                />
                {/* --- YENİ EKLENEN KUPON KARTI --- */}
                <DashboardCard 
                    title="Kupon Yönetimi"
                    description="İndirim kuponları oluştur, kullanım limitlerini ve son kullanma tarihlerini yönet."
                    link="/admin/kuponlar"
                    icon={Ticket}
                />
                <DashboardCard 
                    title="Mağaza Ayarları"
                    description="Kargo ücreti, ücretsiz kargo limiti gibi genel mağaza ayarlarını yönet."
                    link="/admin/ayarlar"
                    icon={Settings}
                />
                 {/* Müşteri Yönetimi kartı kaldırıldı veya başka bir yere taşındı varsayımıyla */}
            </div>
        </div>
    );
}
