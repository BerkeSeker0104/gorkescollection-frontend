// src/lib/uploadToCloudinary.ts
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error("Dosya yok.");

  // JWT'yi localStorage'dan al
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("İmza alınamadı: Lütfen admin olarak giriş yapın (token yok).");
  }

  // İmza isteği: Authorization header ile (cookie gönderme)
  const sigRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload-signature`,
    {
      method: "POST", // ✅ Backend ile uyumlu
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}), // Model binder boş kalmasın
    }
  );

  if (sigRes.status === 401 || sigRes.status === 403) {
    throw new Error("İmza alınamadı (yetkisiz). Admin olarak giriş yapın.");
  }
  if (!sigRes.ok) {
    throw new Error(`İmza alınamadı (${sigRes.status}).`);
  }

  const sigJson = await sigRes.json();
  const signature = sigJson?.signature;
  const timestamp = sigJson?.timestamp;

  const cloudName =
    sigJson?.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const apiKey =
    sigJson?.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";

  const folder = sigJson?.folder;
  const publicId = sigJson?.publicId;
  const eager = sigJson?.eager;
  const resourceType = sigJson?.resourceType || "auto";

  if (!signature || !timestamp) {
    throw new Error("Geçersiz imza yanıtı (signature/timestamp yok).");
  }
  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary CloudName veya ApiKey eksik (API/ENV).");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", String(signature));

  if (folder) form.append("folder", folder);
  if (publicId) form.append("public_id", publicId);
  if (eager) form.append("eager", eager);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const upRes = await fetch(uploadUrl, { method: "POST", body: form });
  if (!upRes.ok) {
    const errText = await safeText(upRes);
    throw new Error(
      `Cloudinary yükleme başarısız (${upRes.status})${errText ? `: ${errText}` : ""}`
    );
  }

  const json = await upRes.json();
  const secureUrl: string | undefined = json?.secure_url;
  if (!secureUrl)
    throw new Error("Cloudinary yanıtı geçersiz (secure_url yok).");

  return secureUrl;
}

// Yardımcı: hata metnini güvenle çek (boş olabilir)
async function safeText(res: Response) {
  try {
    const t = await res.text();
    return t?.slice(0, 500) || "";
  } catch {
    return "";
  }
}