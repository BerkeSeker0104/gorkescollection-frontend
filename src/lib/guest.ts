// src/lib/guest.ts
export function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("guestId");
}

export function setGuestId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("guestId", id);
}

/**
 * Backend ilk /api/cart çağrısında header ve cookie ile buyerId üretiyor.
 * Burada o header'ı alıp localStorage'a yazıyoruz.
 */
export async function ensureGuestId(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  let gid = getGuestId();
  if (gid) return gid;

  // Backend buyerId yoksa üretip response header'a yazıyor (X-Guest-Id)
  const res = await fetch("/api/cart", { method: "GET", cache: "no-store" });
  const headerId = res.headers.get("X-Guest-Id");
  if (headerId && headerId.trim().length > 0) {
    setGuestId(headerId);
    return headerId;
  }
  return getGuestId();
}