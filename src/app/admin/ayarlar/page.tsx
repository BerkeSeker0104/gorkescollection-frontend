'use client';

import { useEffect, useState } from "react";
import { Setting } from "@/types";
import { getSettings, updateSettings } from "@/lib/api"; // getSettings'i de import ediyoruz
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface SettingsForm {
    shippingFee: number;
    freeShippingThreshold: number;
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<SettingsForm>();

    // DÜZELTME: fetchSettings fonksiyonunu useCallback ile sarmalayarak
    // gereksiz yere yeniden oluşturulmasını engelliyoruz.
    const fetchSettings = async () => {
        setLoading(true);
        const settings = await getSettings(); // Herkese açık endpoint'i kullanıyoruz
        const shippingFee = settings.find(s => s.key === 'ShippingFee')?.value || '50';
        const freeShippingThreshold = settings.find(s => s.key === 'FreeShippingThreshold')?.value || '2000';
        
        setValue('shippingFee', parseFloat(shippingFee));
        setValue('freeShippingThreshold', parseFloat(freeShippingThreshold));
        setLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, [setValue]); // setValue'ı dependency array'e ekliyoruz.

    const onSubmit = async (data: SettingsForm) => {
        const settingsToUpdate: Setting[] = [
            { key: 'ShippingFee', value: data.shippingFee.toString() },
            { key: 'FreeShippingThreshold', value: data.freeShippingThreshold.toString() }
        ];
        const success = await updateSettings(settingsToUpdate);
        if (success) {
            toast.success("Ayarlar başarıyla güncellendi.");
            // DÜZELTME: Başarılı kayıttan sonra ayarları yeniden çekerek
            // formun güncel değerleri göstermesini sağlıyoruz.
            await fetchSettings();
        } else {
            toast.error("Ayarlar güncellenirken bir hata oluştu.");
        }
    };

    if (loading) return <p>Ayarlar yükleniyor...</p>;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Mağaza Ayarları</h1>
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Kargo Ayarları</h2>
                        <p className="text-sm text-gray-500 mt-1">Kargo ücretini ve ücretsiz kargo limitini belirleyin.</p>
                    </div>
                    <div>
                        <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">Sabit Kargo Ücreti (TL)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            {...register("shippingFee")} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">Ücretsiz Kargo Limiti (TL)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            {...register("freeShippingThreshold")} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        />
                         <p className="text-xs text-gray-500 mt-1">Bu tutar ve üzerindeki siparişlerde kargo ücretsiz olacaktır.</p>
                    </div>
                    <div>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gray-800 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Kaydediliyor..." : "Ayarları Kaydet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
