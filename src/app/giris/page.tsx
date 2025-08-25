'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
// YENİ: useState ve yeni API fonksiyonunu import ediyoruz
import { useState } from "react";
import { resendConfirmationEmail } from "@/lib/api";

const loginSchema = z.object({
    // GÜNCELLENDİ: Artık kullanıcı adı yerine sadece e-posta istiyoruz.
    username: z.string().email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(1, "Parola gereklidir."),
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A58E74] focus:ring-[#A58E74] p-3";

export default function LoginPage() {
    const { login } = useAuth();

    // YENİ: Hata mesajlarını ve "Tekrar Gönder" durumunu yönetmek için state'ler
    const [serverError, setServerError] = useState<string | null>(null);
    const [showResend, setShowResend] = useState(false);
    const [resendStatus, setResendStatus] = useState<{ type: 'info' | 'error', text: string } | null>(null);
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });
    
    // GÜNCELLENDİ: onSubmit fonksiyonu artık hata mesajlarını yakalıyor.
    const onSubmit = async (data: LoginData) => {
        // Her denemede eski mesajları temizle
        setServerError(null);
        setShowResend(false);
        setResendStatus(null);
        
        // AuthContext'teki login fonksiyonunun hata mesajını döndürdüğünü varsayıyoruz.
        // Bu, AuthContext'te küçük bir değişiklik gerektirebilir.
        const error = await login(data); 

        if (error) {
            // Eğer hata "doğrulama" ile ilgiliyse, özel bir durum yönetimi yap.
            if (error.includes('doğrulayın')) {
                setServerError(error);
                setShowResend(true);
            } else {
                setServerError(error);
            }
        }
    };

    // YENİ: "Tekrar Gönder" butonuna tıklandığında çalışacak fonksiyon
    const handleResendEmail = async () => {
        const email = (document.getElementById('username') as HTMLInputElement)?.value;
        if (!email) {
            setResendStatus({ type: 'error', text: 'Lütfen e-posta alanını doldurun.'});
            return;
        }

        setResendStatus({ type: 'info', text: 'Gönderiliyor...'});
        const result = await resendConfirmationEmail(email);
        setResendStatus({ type: 'info', text: result.message });
    };

    return (
        <div className="bg-[#FAF7F5] pt-40 pb-24 min-h-screen">
            <div className="container mx-auto max-w-md px-4">
                <h1 className="text-3xl font-bold text-center text-zinc-800 mb-8">Giriş Yap</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                    
                    {/* YENİ: Genel sunucu hatalarını göstermek için */}
                    {serverError && !showResend && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                            {serverError}
                        </div>
                    )}
                    
                    <div>
                        {/* GÜNCELLENDİ: Etiket "E-posta" olarak değiştirildi */}
                        <label htmlFor="username" className="block text-sm font-medium text-zinc-600">E-posta</label>
                        <input type="email" id="username" {...register("username")} className={inputStyle}/>
                        {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-zinc-600">Parola</label>
                        <input type="password" {...register("password")} className={inputStyle}/>
                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    
                    {/* YENİ: Doğrulanmamış e-posta hatası için özel bölüm */}
                    {showResend && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md text-sm">
                            <p className="font-bold">Hesap Doğrulanmamış</p>
                            <p className="mb-2">{serverError}</p>
                            <button type="button" onClick={handleResendEmail} className="font-bold underline hover:text-yellow-900">
                                Tekrar Doğrulama E-postası Gönder
                            </button>
                        </div>
                    )}

                    {/* YENİ: Tekrar gönderme işlemi sonucu mesajı */}
                    {resendStatus && (
                         <div className={`p-3 rounded-md text-sm ${resendStatus.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-700'}`}>
                            {resendStatus.text}
                        </div>
                    )}

                    <div className="text-right text-sm">
                        <Link href="/sifremi-unuttum" className="font-medium text-zinc-600 hover:text-[#A58E74]">
                            Şifremi unuttum?
                        </Link>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md border border-transparent bg-[#2a2a2a] px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-90 disabled:bg-zinc-400"
                    >
                        {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-zinc-600">
                    Hesabın yok mu?{' '}
                    <Link href="/kayit" className="font-medium text-zinc-800 hover:text-[#A58E74]">
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    );
}