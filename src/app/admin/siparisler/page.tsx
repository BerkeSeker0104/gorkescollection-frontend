    'use client';

    import { useEffect, useState } from "react";
    import { Order } from "@/types";
    import { getAllOrders } from "@/lib/api";
    import Link from "next/link";

    const translateStatus = (status: string) => {
        switch(status) {
            case 'PaymentSucceeded': return 'Yeni Sipariş';
            case 'Shipped': return 'Kargolandı';
            case 'Delivered': return 'Teslim Edildi';
            default: return 'Beklemede';
        }
    }

    export default function AdminOrdersPage() {
        const [orders, setOrders] = useState<Order[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchOrders = async () => {
                setLoading(true);
                const fetchedOrders = await getAllOrders();
                setOrders(fetchedOrders);
                setLoading(false);
            };
            fetchOrders();
        }, []);

        if (loading) return <p>Siparişler yükleniyor...</p>;

        return (
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Sipariş Yönetimi</h1>
                <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4">Sipariş ID</th>
                                <th className="p-4">Müşteri</th>
                                <th className="p-4">Tarih</th>
                                <th className="p-4">Toplam Tutar</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">#{order.id}</td>
                                    <td className="p-4">{order.shippingAddress.fullName}</td>
                                    <td className="p-4">{new Date(order.orderDate).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4">{(order.subtotal + order.shippingFee).toFixed(2)} TL</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {translateStatus(order.orderStatus)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/admin/siparisler/${order.id}`} className="text-blue-600 hover:underline">
                                            Detayları Gör
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    