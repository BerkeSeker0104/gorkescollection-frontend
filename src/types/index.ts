export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  priceOriginal?: number;
  priceFinal?: number;
  isOnSaleNow?: boolean;
  discountPercent?: number;
  saleLabel?: string | null;
  saleStartUtc?: string | null;
  saleEndUtc?: string | null;
  stockQuantity: number;
  displayOrder?: number | null;
  categoryName: string;
  categoryId: number;
  categorySlug: string;
  isFeatured?: boolean;
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
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface CartDto {
  id: number;
  buyerId: string;
  items: CartItemDto[];
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedCouponCode?: string;
}

export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
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

export interface Address {
  id: number;
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface AdminProductDto {
  id?: number;
  sku: string;
  displayOrder?: number | null;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrls: string[];
  specifications: Record<string, string>;
  isFeatured: boolean;
  saleType?: 'percentage' | 'amount' | null;
  saleValue?: number | null;
  saleStartUtc?: string | null;
  saleEndUtc?: string | null;
  saleLabel?: string | null;
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

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAtUtc: string;
  authorUsername: string;
}

export interface StockNotificationSubscriber {
  userEmail: string;
  requestDate: string; // ISO date string
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'Percentage' | 'Amount';
  discountValue: number;
  expiryDate?: string | null;
  isActive: boolean;
  usageLimit?: number | null;
  timesUsed: number;
}