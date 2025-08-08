'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Yükleme bittiğinde ve kullanıcı admin değilse, ana sayfaya yönlendir.
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  // Yükleme sırasında veya kullanıcı admin değilse hiçbir şey gösterme.
  if (loading || !isAdmin) {
    return <div className="pt-40 text-center">Yönlendiriliyor...</div>;
  }

  // Eğer kullanıcı admin ise, altındaki sayfaları (children) göster.
  return <div className="pt-40">{children}</div>;
}
