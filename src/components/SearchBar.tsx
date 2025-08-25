// Dosya: src/components/SearchBar.tsx (YENİ DOSYA)

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      // Kullanıcıyı arama sonuçları sayfasına yönlendir
      router.push(`/arama?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs" role="search">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ürün ara..."
        className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 placeholder-gray-500"
        aria-label="Ürün arama"
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Ara"
      >
        <Search size={18} />
      </button>
    </form>
  );
};