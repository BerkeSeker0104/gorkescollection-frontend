'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const loginSchema = z.object({
    username: z.string().min(1, "Kullanıcı adı veya e-posta gereklidir."),
    password: z.string().min(1, "Parola gereklidir."),
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A58E74] focus:ring-[#A58E74] p-3";

export default function LoginPage() {
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });
    
    const onSubmit = async (data: LoginData) => {
        await login(data);
    };

    return (
        <div className="bg-[#FAF7F5] pt-40 pb-24 min-h-screen">
            <div className="container mx-auto max-w-md px-4">
                <h1 className="text-3xl font-bold text-center text-zinc-800 mb-8">Giriş Yap</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-zinc-600">Kullanıcı Adı veya E-posta</label>
                        <input type="text" {...register("username")} className={inputStyle}/>
                        {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-zinc-600">Parola</label>
                        <input type="password" {...register("password")} className={inputStyle}/>
                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    
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
