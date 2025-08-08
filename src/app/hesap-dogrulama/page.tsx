'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmEmail } from '@/lib/api';
import Link from 'next/link';

function ConfirmationStatus() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Yönlendirme için router'ı kullanıyoruz
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const userId = searchParams.get('userId');
        const token = searchParams.get('token');

        if (userId && token) {
            const verifyEmail = async () => {
                const success = await confirmEmail(userId, token);
                if (success) {
                    setStatus('success');
                    // --- DEĞİŞİKLİK BURADA ---
                    // Başarılı olduğunda, 2 saniye sonra kullanıcıyı giriş sayfasına yönlendir.
                    setTimeout(() => {
                        router.push('/giris?verified=true');
                    }, 2000);
                } else {
                    setStatus('error');
                }
            };
            verifyEmail();
        } else {
            setStatus('error');
        }
    }, [searchParams, router]);

    if (status === 'loading') {
        return <p className="text-center text-gray-600">Hesabınız doğrulanıyor, lütfen bekleyin...</p>;
    }

    if (status === 'error') {
        return (
            <div className="bg-red-100 border border-red-200 text-red-800 p-6 rounded-lg text-center shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Doğrulama Başarısız</h2>
                <p>Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir. Lütfen tekrar deneyin.</p>
                <Link href="/kayit" className="font-bold hover:underline mt-4 inline-block">
                    Kayıt sayfasına dön
                </Link>
            </div>
        );
    }
    
    // Başarılı olduğunda bu mesaj gösterilecek ve sonra yönlendirme yapılacak.
    return (
        <div className="bg-green-100 border border-green-200 text-green-800 p-6 rounded-lg text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Doğrulama Başarılı!</h2>
            <p>Hesabınız başarıyla doğrulandı. Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
    );
}


export default function ConfirmEmailPage() {
    return (
        <div className="bg-gray-50 pt-40">
            <div className="container mx-auto max-w-md px-4 py-16">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Hesap Doğrulama</h1>
                <Suspense fallback={<p>Yükleniyor...</p>}>
                    <ConfirmationStatus />
                </Suspense>
            </div>
        </div>
    );
}
