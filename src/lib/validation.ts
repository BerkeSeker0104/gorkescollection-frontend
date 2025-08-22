// src/lib/validation.ts
import * as z from "zod";

/** Adres formu şeması */
export const addressSchema = z.object({
  fullName: z.string().min(3, "Ad Soyad gereklidir."),
  phoneNumber: z
    .string()
    .min(10, "Telefon numarası 10 haneli olmalıdır.")
    .max(10, "Telefon numarası 10 haneli olmalıdır.")
    .regex(/^[0-9]+$/, "Sadece rakam giriniz."),
  address1: z.string().min(10, "Adres gereklidir."),
  address2: z.string().optional(),
  city: z.string().min(2, "Şehir gereklidir."),
  district: z.string().min(2, "İlçe gereklidir."),
  postalCode: z
    .string()
    .min(5, "Posta kodu gereklidir.")
    .max(5, "Posta kodu 5 haneli olmalıdır."),
  country: z.string().min(2, "Ülke gereklidir."),
});
export type AddressSchema = z.infer<typeof addressSchema>;

/** Parola değiştirme şeması */
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir."),
    newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır."),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmNewPassword"],
  });
export type PasswordSchema = z.infer<typeof passwordSchema>;
