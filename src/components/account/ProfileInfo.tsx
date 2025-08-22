'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { changePassword } from '@/lib/api';
import type { ChangePasswordData } from '@/types';
import { passwordSchema } from "../../lib/validation";

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A58E74] focus:ring-[#A58E74] p-2 text-sm";
const buttonPrimaryStyle = "bg-[#2a2a2a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 disabled:bg-zinc-400 transition-colors";

export default function ProfileInfo() {
  const { user } = useAuth();
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    setServerMessage(null);
    const result = await changePassword(data);
    setServerMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) reset();
  };

  return (
    <div className="divide-y divide-gray-200">
      <div className="space-y-4 pb-8">
        <div>
          <label className="text-sm font-medium text-zinc-500">Kullanıcı Adı</label>
          <p className="text-zinc-800 mt-1">{user?.username}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-500">E-posta</label>
          <p className="text-zinc-800 mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="pt-8">
        <h3 className="text-lg font-medium text-zinc-800">Parola Değiştir</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-zinc-700">Mevcut Parola</label>
            <input type="password" {...register('currentPassword')} className={inputStyle} />
            {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Yeni Parola</label>
            <input type="password" {...register('newPassword')} className={inputStyle} />
            {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Yeni Parola (Tekrar)</label>
            <input type="password" {...register('confirmNewPassword')} className={inputStyle} />
            {errors.confirmNewPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmNewPassword.message}</p>}
          </div>

          {serverMessage && (
            <div className={`p-3 rounded-md text-sm ${serverMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {serverMessage.text}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className={buttonPrimaryStyle}>
              {isSubmitting ? 'Güncelleniyor...' : 'Parolayı Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
