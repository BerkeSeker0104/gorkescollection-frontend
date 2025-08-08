import { useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string;
}

export default function ImageUploader({ onUploadSuccess, initialImageUrl }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const secureUrl = await uploadToCloudinary(file);
      onUploadSuccess(secureUrl);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Görsel yükleme hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Ürün Görseli</label>
      <div className="mt-1 flex items-center gap-4">
        <div className="w-24 h-24 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden border">
          {preview ? (
            <Image src={preview} alt="Ürün önizlemesi" width={96} height={96} className="object-cover"/>
          ) : (
            <UploadCloud className="text-gray-400"/>
          )}
        </div>
        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
        <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
          {loading ? "Yükleniyor..." : "Görsel Seç"}
        </label>
      </div>
    </div>
  );
}
