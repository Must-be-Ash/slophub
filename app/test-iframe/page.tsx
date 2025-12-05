'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestIframePage() {
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testUrl = 'https://funnel-cryptocurrency-1764899094965-n485njnsl.vercel.app/';

  const captureScreenshot = async () => {
    setLoading(true);
    setError(null);
    setScreenshotUrl(null);

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Screenshot failed');
      }

      const data = await response.json();
      setScreenshotUrl(data.screenshotUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Screenshot Test
        </h1>
        <p className="text-slate-600 mb-6">
          Testing screenshot capture of deployed Vercel site
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Target URL:</h2>
              <p className="text-sm text-slate-600 font-mono mt-1">{testUrl}</p>
            </div>
            <button
              onClick={captureScreenshot}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Capturing...' : 'Capture Screenshot'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-black"></div>
            <p className="mt-4 text-slate-600">Capturing screenshot...</p>
          </div>
        )}

        {screenshotUrl && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
            <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-600 font-mono truncate">
                  {testUrl}
                </div>
              </div>
            </div>
            <div className="relative bg-slate-50 p-4">
              <Image
                src={screenshotUrl}
                alt="Screenshot of deployed site"
                width={1280}
                height={720}
                className="w-full h-auto border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {screenshotUrl && (
          <div className="bg-emerald-50 rounded-xl p-6 shadow-sm border border-emerald-200 mb-6">
            <h2 className="text-lg font-semibold text-emerald-900 mb-3">
              ✅ Success!
            </h2>
            <p className="text-sm text-emerald-700">
              Screenshot captured and uploaded to Vercel Blob successfully.
            </p>
            <p className="text-xs text-emerald-600 mt-2 font-mono break-all">
              {screenshotUrl}
            </p>
          </div>
        )}

        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
