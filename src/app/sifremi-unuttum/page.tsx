'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ForgotPasswordData } from "@/types";
import { forgotPassword } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
    email: z.string().email("Lütfen geçerli bir e-posta adresi girin."),
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-3";

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });
    
    const onSubmit = async (data: ForgotPasswordData) => {
        const result = await forgotPassword(data);
        setMessage(result.message);
    };

    return (
        <div className="bg-gray-50 pt-40">
            <div className="container mx-auto max-w-md px-4 py-16">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Şifremi Unuttum</h1>
                <p className="text-center text-gray-600 mb-8">
                    Endişelenmeyin! E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                </p>

                {message ? (
                    <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg text-center">
                        <p>{message}</p>
                        <Link href="/giris" className="font-bold hover:underline mt-4 inline-block">
                            Giriş sayfasına dön
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                            <input type="email" {...register("email")} className={inputStyle}/>
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                        </div>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-md border border-transparent bg-gray-900 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
