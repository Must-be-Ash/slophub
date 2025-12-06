'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TextShimmer } from '@/components/ui/text-shimmer';

export function FloatingCTA() {
  return (
    <Link
      href="https://slophub.xyz"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        textDecoration: 'none',
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* 3D Button shadow layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom right, #1e293b, #020617)',
            borderRadius: '9999px',
            transform: 'translate(2px, 2px)',
            filter: 'blur(4px)',
            opacity: 0.4,
          }}
        />

        {/* Main button */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'linear-gradient(to bottom right, #0f172a, #000000)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '9999px',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          className="group hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:scale-105"
        >
          {/* Logo icon */}
          <Image
            src="/logo-w-t.svg"
            alt="Slophub"
            width={20}
            height={20}
            style={{ flexShrink: 0, objectFit: 'contain', background: 'transparent' }}
            unoptimized
          />

          {/* Text with highlighted slophub.xyz */}
          <span style={{ fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>created with</span>
            <TextShimmer
              duration={2}
              className="[--base-color:theme(colors.white)] [--base-gradient-color:theme(colors.blue.300)]"
            >
              slophub.xyz
            </TextShimmer>
          </span>
        </div>
      </div>
    </Link>
  );
}
