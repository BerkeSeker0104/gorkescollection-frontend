'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResetPasswordData } from "@/types";
import { resetPassword } from "@/lib/api";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır."),
    confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmNewPassword"],
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-3";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        setToken(searchParams.get('token'));
        setEmail(searchParams.get('email'));
    }, [searchParams]);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Omit<ResetPasswordData, 'email' | 'token'>>({
        resolver: zodResolver(resetPasswordSchema),
    });
    
    const onSubmit = async (data: Omit<ResetPasswordData, 'email' | 'token'>) => {
        if (!email || !token) {
            setMessage({ type: 'error', text: 'Geçersiz veya eksik sıfırlama bilgileri.' });
            return;
        }
        const result = await resetPassword({ ...data, email, token });
        setMessage({
            type: result.success ? 'success' : 'error',
            text: result.message
        });
    };

    if (!token || !email) {
        return (
            <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg text-center">
                <p>Geçersiz sıfırlama bağlantısı. Lütfen e-postanızdaki bağlantıya tıkladığınızdan emin olun veya yeni bir sıfırlama talebi oluşturun.</p>
            </div>
        );
    }

    if (message) {
         return (
            <div className={`${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'} p-4 rounded-lg text-center`}>
                <p>{message.text}</p>
                {message.type === 'success' && (
                    <Link href="/giris" className="font-bold hover:underline mt-4 inline-block">
                        Giriş yapmak için tıklayın
                    </Link>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Yeni Parola</label>
                <input type="password" {...register("newPassword")} className={inputStyle}/>
                {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
            </div>
            <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Yeni Parola (Tekrar)</label>
                <input type="password" {...register("confirmNewPassword")} className={inputStyle}/>
                {errors.confirmNewPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmNewPassword.message}</p>}
            </div>
            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border border-transparent bg-gray-900 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-700 disabled:bg-gray-400"
            >
                {isSubmitting ? "Kaydediliyor..." : "Şifreyi Kaydet"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="bg-gray-50 pt-40">
            <div className="container mx-auto max-w-md px-4 py-16">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Yeni Şifre Belirle</h1>
                {/* Suspense, useSearchParams'in client-side render'da çalışmasını sağlar */}
                <Suspense fallback={<p>Yükleniyor...</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
