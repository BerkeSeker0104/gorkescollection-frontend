import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast"; // DEĞİŞİKLİK: Toaster'ı import ediyoruz

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gorke's Collection",
  description: "Şıklığınızı tamamlayan paslanmaz çelik takılar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              {/* DEĞİŞİKLİK: Bildirimlerin görüneceği alanı ekliyoruz */}
              <Toaster position="bottom-right" />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
