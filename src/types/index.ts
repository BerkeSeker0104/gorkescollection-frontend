// src/types/index.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
  categoryId: number;   
  categorySlug: string;
  imageUrls: string[];
  specifications: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CartItemDto {
  productId: number;
  name:string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface CartDto {
  id: number;
  buyerId: string;
  items: CartItemDto[];
}

// --- GÜNCELLENDİ ---
export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  phoneNumber: string; // <-- YENİ
}

export interface UserDto {
  username: string;
  email: string;
  token: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData extends LoginData {
  email: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  buyerId: string;
  shippingAddress: ShippingAddress;
  orderDate: string;
  orderItems: OrderItem[];
  subtotal: number;
  shippingFee: number;
  orderStatus: string;
  total: number;
  cargoCompany?: string;
  trackingNumber?: string;
}

// --- GÜNCELLENDİ ---
export interface Address {
  id: number;
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  phoneNumber: string; // <-- YENİ
  isDefault: boolean;
}

export interface AdminProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrls: string[];
  specifications: Record<string, string>;
}

export interface ShipOrderDto {
  cargoCompany: string;
  trackingNumber: string;
}

export interface AdminCategoryDto {
  name: string;
  slug: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}