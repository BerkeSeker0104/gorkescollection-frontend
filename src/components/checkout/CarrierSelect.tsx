'use client';

import Image from "next/image";
import { useId } from "react";

export type CarrierKey = "Aras Kargo" | "PTT Kargo" | "Sürat Kargo";

export const CARRIER_OPTIONS: { key: CarrierKey; label: string; logo: string }[] = [
  { key: "Aras Kargo",   label: "Aras Kargo",   logo: "/images/carriers/aras.svg" },
  { key: "PTT Kargo",    label: "PTT Kargo",    logo: "/images/carriers/ptt.svg" },
  { key: "Sürat Kargo",  label: "Sürat Kargo",  logo: "/images/carriers/surat.svg" },
];

type Props = {
  value: CarrierKey | null;
  onChange: (v: CarrierKey) => void;
};

export default function CarrierSelect({ value, onChange }: Props) {
  const name = useId();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Kargo Firması Seçin</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARRIER_OPTIONS.map(opt => {
          const checked = value === opt.key;
          return (
            <label
              key={opt.key}
              className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition
                          ${checked ? "ring-2 ring-gray-800 border-gray-800" : "hover:border-gray-400"}`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(opt.key)}
              />
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={opt.logo}
                  alt={opt.label}
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="text-sm">{opt.label}</span>
            </label>
          );
        })}
      </div>
      {!value && (
        <p className="text-xs text-red-600 mt-2">Lütfen bir kargo firması seçin.</p>
      )}
    </div>
  );
}