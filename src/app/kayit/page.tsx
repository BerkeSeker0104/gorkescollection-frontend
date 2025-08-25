'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RegisterData } from "@/types";
import { registerUser } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";

// GÜNCELLENDİ: Zod şeması artık username yerine firstName ve lastName içeriyor.
const registerSchema = z.object({
    firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır."),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır."),
    email: z.string().email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(6, "Parola en az 6 karakter olmalıdır."),
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A58E74] focus:ring-[#A58E74] p-3";

export default function RegisterPage() {
    const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });
    
    const onSubmit = async (data: RegisterData) => {
        setServerMessage(null);
        const result = await registerUser(data);
        setServerMessage({ type: result.success ? 'success' : 'error', text: result.message });
    };

    return (
        <div className="bg-[#FAF7F5] pt-40 pb-24 min-h-screen">
            <div className="container mx-auto max-w-md px-4">
                <h1 className="text-3xl font-bold text-center text-zinc-800 mb-8">Hesap Oluştur</h1>

                {serverMessage?.type === 'success' ? (
                    <div className="bg-green-100 border border-green-200 text-green-800 p-6 rounded-lg text-center shadow-md">
                        <h2 className="text-xl font-semibold mb-2">Kayıt Başarılı!</h2>
                        <p>{serverMessage.text}</p>
                        <Link href="/giris" className="font-bold hover:underline mt-4 inline-block">
                            Giriş sayfasına dön
                        </Link>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                            {serverMessage?.type === 'error' && (
                                <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                                    {serverMessage.text}
                                </div>
                            )}

                            {/* GÜNCELLENDİ: "Kullanıcı Adı" yerine "Ad" ve "Soyad" alanları eklendi. */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-600">Ad</label>
                                    <input type="text" {...register("firstName")} className={inputStyle}/>
                                    {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-600">Soyad</label>
                                    <input type="text" {...register("lastName")} className={inputStyle}/>
                                    {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-600">E-posta</label>
                                <input type="email" {...register("email")} className={inputStyle}/>
                                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-zinc-600">Parola</label>
                                <input type="password" {...register("password")} className={inputStyle}/>
                                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-md border border-transparent bg-[#2a2a2a] px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-90 disabled:bg-zinc-400"
                            >
                                {isSubmitting ? "Kayıt Olunuyor..." : "Kayıt Ol"}
                            </button>
                        </form>
                        <p className="mt-6 text-center text-sm text-zinc-600">
                            Zaten bir hesabın var mı?{' '}
                            <Link href="/giris" className="font-medium text-zinc-800 hover:text-[#A58E74]">
                                Giriş Yap
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}