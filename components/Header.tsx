'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Grid3x3 } from 'lucide-react';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { WalletDropdown } from './WalletDropdown';

export function Header() {
  const { isSignedIn } = useIsSignedIn();

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
            className="text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors" 
            style={{ fontFamily: 'var(--font-caprasimo)' }}
          >
            Slophub
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
          >
            <Grid3x3 className="h-4 w-4" />
            Gallery
          </Link>

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


