import Link from 'next/link';
import Image from 'next/image';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Subtle grid pattern background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Simple header without auth */}
      <header className="relative py-4 px-6 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/logo-ts.svg"
              alt="Slophub"
              width={50}
              height={50}
              className="object-contain"
            />
            <span
              className="text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors"
              style={{ fontFamily: 'var(--font-caprasimo)' }}
            >
              Slophub
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="max-w-2xl w-full text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-ts.png"
              alt="Slophub"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* 404 Number */}
          <h1
            className="text-9xl font-bold text-slate-900 mb-4 opacity-10"
            style={{ fontFamily: 'var(--font-caprasimo)' }}
          >
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-slate-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>

            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Search className="h-4 w-4" />
              Browse Gallery
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
