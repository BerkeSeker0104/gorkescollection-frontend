export async function uploadToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error("Dosya yok.");

  const sigRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload-signature`,
    {
      method: "POST", // ✅ Backend ile uyumlu
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Model binder boş kalmasın
      credentials: "include", // Auth cookie’yi gönder
    }
  );

  if (sigRes.status === 401) {
    throw new Error("İmza alınamadı (401). Admin olarak giriş yapın.");
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
  if (!upRes.ok) throw new Error("Cloudinary yükleme başarısız.");

  const json = await upRes.json();
  const secureUrl: string | undefined = json?.secure_url;
  if (!secureUrl)
    throw new Error("Cloudinary yanıtı geçersiz (secure_url yok).");

  return secureUrl;
}
