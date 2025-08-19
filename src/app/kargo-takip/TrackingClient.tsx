'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type TrackingEvent = {
  timeUtc?: string | null;
  code?: string | null;
  description?: string | null;
  location?: string | null;
  raw?: string | null;
};

type TrackingResult = {
  postNumber?: string | null;
  carrierName?: string | null;
  statusCode?: string | null;
  statusText?: string | null;
  lastUpdateUtc?: string | null;
  estimatedDeliveryUtc?: string | null;
  isDelivered: boolean;
  events: TrackingEvent[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function TrackingClient() {
  const sp = useSearchParams();
  const initialNo = sp.get('no') || '';

  const [postNo, setPostNo] = useState<string>(initialNo);
  const [data, setData] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!initialNo) return;
    void handleSearch(initialNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNo]);

  async function handleSearch(no?: string) {
    const q = (no ?? postNo).trim();
    if (!q) {
      setErr('Lütfen bir takip numarası girin.');
      setData(null);
      return;
    }
    try {
      setErr(null);
      setLoading(true);
      setData(null);

      const res = await fetch(`${API_URL}/api/public/tracking/${encodeURIComponent(q)}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Takip sorgulanamadı.');
      }
      const payload = (await res.json()) as TrackingResult;
      payload.events = Array.isArray(payload.events) ? payload.events : [];
      setData(payload);
    } catch (e: any) {
      setErr(e?.message || 'Beklenmeyen bir hata oluştu.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const orderedEvents = useMemo(() => {
    if (!data?.events) return [];
    return [...data.events].sort((a, b) => {
      const ta = a.timeUtc ? new Date(a.timeUtc).getTime() : 0;
      const tb = b.timeUtc ? new Date(b.timeUtc).getTime() : 0;
      return ta - tb;
    });
  }, [data]);

  return (
    <div className="bg-gray-50 min-h-screen pt-36 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kargo Takibi</h1>
        <p className="text-gray-600 mb-6">
          Takip numaranızı girerek gönderinizin durumunu görüntüleyin.
        </p>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              placeholder="Takip Numarası (Post No)"
              value={postNo}
              onChange={(e) => setPostNo(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="rounded-md bg-gray-900 text-white px-5 py-2 font-medium hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Sorgulanıyor…' : 'Sorgula'}
            </button>
          </div>

          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

          {data && (
            <div className="mt-6 space-y-6">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="text-sm text-gray-500">Takip Numarası</div>
                    <div className="font-semibold text-gray-900">{data.postNumber || postNo}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Kargo Firması</div>
                    <div className="font-semibold text-gray-900">{data.carrierName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Durum</div>
                    <div className="font-semibold text-gray-900">
                      {data.statusText || data.statusCode || (data.isDelivered ? 'Teslim edildi' : 'Güncelleniyor')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Son Güncelleme:</span>{' '}
                    <span className="text-gray-900">
                      {data.lastUpdateUtc ? new Date(data.lastUpdateUtc).toLocaleString('tr-TR') : '-'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Tahmini Teslim:</span>{' '}
                    <span className="text-gray-900">
                      {data.estimatedDeliveryUtc ? new Date(data.estimatedDeliveryUtc).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Gönderi Hareketleri</h2>
                {orderedEvents.length === 0 ? (
                  <div className="text-sm text-gray-500">Henüz hareket bilgisi bulunamadı.</div>
                ) : (
                  <ul className="relative border-l border-gray-200 pl-4">
                    {orderedEvents.map((ev, idx) => {
                      const isLast = idx === orderedEvents.length - 1;
                      return (
                        <li key={idx} className="mb-6">
                          <div className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full bg-gray-900" />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                            <div className="font-medium text-gray-900">
                              {ev.description || ev.code || 'Durum güncellendi'}
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {ev.timeUtc ? new Date(ev.timeUtc).toLocaleString('tr-TR') : ''}
                            </div>
                          </div>
                          {(ev.location || ev.code) && (
                            <div className="mt-1 text-sm text-gray-600">
                              {ev.location && <span className="mr-2">📍 {ev.location}</span>}
                              {ev.code && <span className="text-gray-500">({ev.code})</span>}
                            </div>
                          )}
                          {!isLast && <div className="mt-4" />}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Takip numaranız size e‑posta/SMS ile gönderilmiş olmalıdır. Bulamazsanız{' '}
          <a className="underline" href="mailto:info@gorkescollection.com">info@gorkescollection.com</a>{' '}
          adresinden bize ulaşabilirsiniz.
        </div>
      </div>
    </div>
  );
}

export default TrackingClient;