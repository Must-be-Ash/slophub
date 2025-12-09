'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Grid3x3, Plus } from 'lucide-react';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { WalletDropdown } from './WalletDropdown';

export function Header() {
  const { isSignedIn } = useIsSignedIn();
  const pathname = usePathname();
  const isGalleryPage = pathname === '/gallery';

  return (
    <header className="relative py-4 px-6 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <Image
            src="/logo-ts.svg"
            alt="Slophub"
            width={50}
            height={50}
            className="object-contain"
          />
          <span 
            className="hidden md:inline text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors" 
            style={{ fontFamily: 'var(--font-caprasimo)' }}
          >
            Slophub
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          {isGalleryPage ? (
            <Link
              href="/"
              className={`inline-flex items-center justify-center gap-2 px-4 text-sm transition-all font-medium ${
                isSignedIn
                  ? 'py-2 text-white bg-black hover:bg-slate-800 rounded-xl'
                  : 'py-3 text-slate-900 bg-transparent border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-full'
              }`}
            >
              <Plus className="h-4 w-4" />
              create
            </Link>
          ) : (
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
            >
              <Grid3x3 className="h-4 w-4" />
              Gallery
            </Link>
          )}

          {/* Auth / Wallet */}
          {isSignedIn ? (
            <WalletDropdown />
          ) : (
            <AuthButton />
          )}
        </nav>
      </div>
    </header>
  );
}


