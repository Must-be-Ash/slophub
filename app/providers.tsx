'use client';

import { CDPReactProvider, type Theme } from '@coinbase/cdp-react';

const CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? '',
  appName: 'AI Landing Page Generator',
  appLogoUrl: '/logo.svg',
  authMethods: ['email', 'oauth:x', 'oauth:google'] as any,  // Enable email, X/Twitter, and Google OAuth login
  ethereum: {
    createOnLogin: "eoa" as const,  // EOA wallet only (not smart account)
  },
  solana: {
    // No Solana wallet
  },
};

// Theme to match the app's minimal design
const themeOverrides: Partial<Theme> = {
  // Background colors - match app's clean white aesthetic
  "colors-bg-default": "#ffffff",
  "colors-bg-alternate": "#fafafa",
  "colors-bg-primary": "#000000",
  "colors-bg-secondary": "#f5f5f5",

  // Text colors - match app's slate color palette
  "colors-fg-default": "#0f172a",
  "colors-fg-muted": "#64748b",
  "colors-fg-primary": "#0f172a",
  "colors-fg-onPrimary": "#ffffff",

  // Border colors - subtle like the rest of the app
  "colors-line-default": "#e2e8f0",
  "colors-line-heavy": "#cbd5e1",

  // Typography - match existing fonts
  "font-family-sans": "var(--font-geist-sans), system-ui, sans-serif",
  "font-size-base": "14px",
};

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CDPReactProvider config={CONFIG} theme={themeOverrides}>
      {children}
    </CDPReactProvider>
  );
}
